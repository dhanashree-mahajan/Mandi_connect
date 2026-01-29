import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export const options = { headerShown: false };

const BASE_URL = "https://mandiconnect.onrender.com";

/* ---------- TYPES ---------- */
type DemandStatus = "active" | "fulfilled" | "cancelled";

type Demand = {
  id?: string;
  _id?: string;
  CropId: string;
  Market: string;
  ExpectedPrice: { Value: number };
  RequiredQuantity: { Value: number; Unit: string };
  createdAt?: string;
};

export default function BuyerDashboard() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<DemandStatus>("active");
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cropMap, setCropMap] = useState<Record<string, string>>({});

  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [showModal, setShowModal] = useState(false);

  /* ---------- Helpers ---------- */
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Missing token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- Load crops ---------- */
  const loadCrops = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${BASE_URL}/getAllCrop`, { headers });

      const map: Record<string, string> = {};
      res.data.forEach((c: any) => {
        map[c.id || c._id] = c.name;
      });

      setCropMap(map);
    } catch (err) {
      console.log("Failed to load crops", err);
    }
  };

  /* ---------- Fetch demands ---------- */
  const fetchDemands = async (status: DemandStatus) => {
    try {
      const headers = await getAuthHeaders();

      const res = await axios.get(
        `${BASE_URL}/marketplace/buyer/status/${status}`,
        { headers },
      );

      setDemands(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Failed to fetch demands", err);
      setDemands([]);
    }
  };

  /* ---------- Delete demand ---------- */
  const deleteDemand = async (id: string) => {
    Alert.alert(
      "Delete Demand",
      "Are you sure you want to delete this demand?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = await getAuthHeaders();
              await axios.delete(`${BASE_URL}/marketplace/buyer/delete/${id}`, {
                headers,
              });
              fetchDemands(activeTab);
            } catch (err) {
              console.log("Failed to delete demand", err);
            }
          },
        },
      ],
    );
  };

  /* ---------- Refresh on focus ---------- */
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([loadCrops(), fetchDemands(activeTab)]).finally(() =>
        setLoading(false),
      );
    }, [activeTab]),
  );

  /* ---------- Pull to refresh ---------- */
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCrops(), fetchDemands(activeTab)]);
    setRefreshing(false);
  };

  /* ---------- Render item ---------- */
  const renderItem = ({ item }: { item: Demand }) => {
    const cropName = cropMap[item.CropId] || "Unknown Crop";

    return (
      <View style={styles.card}>
        <Text style={styles.crop}>{cropName}</Text>
        <Text style={styles.market}>{item.Market}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>₹{item.ExpectedPrice.Value}</Text>
          <Text style={styles.qty}>
            {item.RequiredQuantity.Value} {item.RequiredQuantity.Unit}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => {
              setSelectedDemand(item);
              setShowModal(true);
            }}
          >
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => deleteDemand(item._id || item.id!)}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />

      <Text style={styles.title}>🌾 Buyer Dashboard</Text>

      <View style={styles.tabRow}>
        {(["active", "fulfilled", "cancelled"] as DemandStatus[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={demands}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            (item._id || item.id || index).toString()
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {showModal && selectedDemand && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Demand Details</Text>

            <Detail
              label="Crop"
              value={cropMap[selectedDemand.CropId] || "Unknown"}
            />
            <Detail label="Market" value={selectedDemand.Market} />
            <Detail
              label="Price"
              value={`₹${selectedDemand.ExpectedPrice.Value}`}
            />
            <Detail
              label="Quantity"
              value={`${selectedDemand.RequiredQuantity.Value} ${selectedDemand.RequiredQuantity.Unit}`}
            />
            <Detail
              label="Date"
              value={
                selectedDemand.createdAt
                  ? new Date(selectedDemand.createdAt).toDateString()
                  : "—"
              }
            />
            <Detail
              label="Time"
              value={
                selectedDemand.createdAt
                  ? new Date(selectedDemand.createdAt).toLocaleTimeString()
                  : "—"
              }
            />

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- Detail Row ---------- */
const Detail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 6,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#2E7D32",
  },
  tabText: {
    fontWeight: "700",
    color: "#2E7D32",
  },
  activeTabText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  crop: {
    fontSize: 16,
    fontWeight: "700",
  },
  market: {
    color: "#6B7280",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  price: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  qty: {
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: "#E5E7EB",
  },
  viewBtn: {
    backgroundColor: "#2E7D32",
    marginLeft: "auto",
  },
  viewText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loading: {
    textAlign: "center",
    marginTop: 30,
  },
  modalOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "700",
  },
});
