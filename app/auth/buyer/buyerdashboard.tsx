import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const options = { headerShown: false };

const BASE_URL = "https://mandiconnect.onrender.com";

export default function BuyerDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "active" | "fulfilled" | "cancelled"
  >("active");
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cropMap, setCropMap] = useState<Record<string, string>>({});

  /* ---------- Helpers ---------- */

  const getAuthHeaders = async () => {
    const t = await AsyncStorage.getItem("token");
    if (!t) throw new Error("Missing token");
    return { Authorization: `Bearer ${t}` };
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

  const fetchDemands = async (status: string) => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const res = await axios.get(
        `${BASE_URL}/marketplace/buyer/status/${status}`,
        { headers },
      );

      setDemands(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Failed to fetch demands", err);
      setDemands([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Update status ---------- */

  const updateStatus = async (id: string, status: string) => {
    try {
      const headers = await getAuthHeaders();

      await axios.patch(
        `${BASE_URL}/marketplace/buyer/updateStatus/${id}`,
        { status },
        { headers },
      );

      fetchDemands(activeTab);
    } catch (err) {
      console.log("Failed to update status", err);
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
      loadCrops();
      fetchDemands(activeTab);
    }, [activeTab]),
  );

  /* ---------- Render item ---------- */

  const renderItem = ({ item }: any) => {
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

        {/* ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => deleteDemand(item.id)}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title}>🌾 Buyer Dashboard</Text>

      {/* TABS */}
      <View style={styles.tabRow}>
        {["active", "fulfilled", "cancelled"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
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
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
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
    backgroundColor: "#DCFCE7",
    borderRadius: 6,
    marginRight: 8,
  },

  cancelBtn: {
    backgroundColor: "#FEE2E2",
  },

  deleteBtn: {
    backgroundColor: "#E5E7EB",
  },

  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },

  loading: {
    textAlign: "center",
    marginTop: 30,
  },
});
