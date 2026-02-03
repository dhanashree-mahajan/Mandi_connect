import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce";

/* ================= TYPES ================= */

type FarmerListing = {
  id?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  photoUrl?: string;
  crop?: { name?: string };
  location?: { village?: string; city?: string };
};

type DemandStatus = "active" | "fulfilled" | "cancelled";

type BuyerDemand = {
  id: string;
  cropId: string;
  quantity: number;
  unit: string;
  price: number;
  status: DemandStatus;
};

type Crop = {
  id?: string;
  _id?: string;
  name: string;
};

/* ================= COMPONENT ================= */

export default function Marketplace() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"farmer" | "buyer">("farmer");
  const [demandStatus, setDemandStatus] = useState<DemandStatus>("active");

  const [farmerListings, setFarmerListings] = useState<FarmerListing[]>([]);
  const [buyerDemands, setBuyerDemands] = useState<BuyerDemand[]>([]);
  const [cropMap, setCropMap] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedListing, setSelectedListing] = useState<FarmerListing | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  /* ---------- AUTH ---------- */
  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- LOAD COMMON DATA ---------- */
  const loadCommonData = async () => {
    const headers = await getHeaders();

    const cropRes = await axios.get(`${BASE_URL}/getAllCrop`, { headers });
    const map: Record<string, string> = {};
    cropRes.data.forEach((c: Crop) => {
      const id = c.id || c._id;
      if (id) map[id] = c.name;
    });
    setCropMap(map);

    const farmerRes = await axios.get(
      `${BASE_URL}/marketplace/farmer/getAllListing`,
      { headers },
    );

    setFarmerListings(
      Array.isArray(farmerRes.data)
        ? farmerRes.data.filter((i) => i.status === "active")
        : [],
    );
  };

  /* ---------- LOAD DEMANDS ---------- */
  const loadBuyerDemands = async (status: DemandStatus) => {
    const headers = await getHeaders();

    const res = await axios.get(
      `${BASE_URL}/marketplace/buyer/status/${status}`,
      { headers },
    );

    const mapped: BuyerDemand[] = res.data.map((d: any) => ({
      id: d.id,
      cropId: d.CropId,
      quantity: d.RequiredQuantity?.Value ?? 0,
      unit: d.RequiredQuantity?.Unit ?? "",
      price: d.ExpectedPrice?.Value ?? 0,
      status: d.Status.toLowerCase(),
    }));

    setBuyerDemands(mapped);
  };

  /* ---------- CANCEL DEMAND ---------- */
  const cancelDemand = async (id: string) => {
    Alert.alert(
      "Cancel Demand",
      "Are you sure you want to cancel this demand?",
      [
        { text: "No" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const headers = await getHeaders();
            await axios.put(
              `${BASE_URL}/marketplace/buyer/cancel/${id}`,
              {},
              { headers },
            );
            loadBuyerDemands(demandStatus);
          },
        },
      ],
    );
  };

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadCommonData();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (activeTab === "buyer") {
      loadBuyerDemands(demandStatus);
    }
  }, [activeTab, demandStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommonData();
    if (activeTab === "buyer") {
      await loadBuyerDemands(demandStatus);
    }
    setRefreshing(false);
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌾 Buyer Marketplace</Text>
        </View>

        {/* MAIN TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "farmer" && styles.activeTab]}
            onPress={() => setActiveTab("farmer")}
          >
            <Text style={styles.tabText}>Farmer Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "buyer" && styles.activeTab]}
            onPress={() => setActiveTab("buyer")}
          >
            <Text style={styles.tabText}>Your Demands</Text>
          </TouchableOpacity>
        </View>

        {/* BUYER CONTROLS */}
        {activeTab === "buyer" && (
          <>
            <View style={styles.statusTabs}>
              {(["active", "fulfilled", "cancelled"] as DemandStatus[]).map(
                (s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusTab,
                      demandStatus === s && styles.activeStatusTab,
                    ]}
                    onPress={() => setDemandStatus(s)}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        demandStatus === s && styles.activeStatusText,
                      ]}
                    >
                      {s.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>

            <TouchableOpacity
              style={styles.addDemand}
              onPress={() => router.push("/auth/buyer/addDemand")}
            >
              <Text style={styles.addDemandText}>Add Demand +</Text>
            </TouchableOpacity>
          </>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : activeTab === "farmer" ? (
          <FlatList
            data={farmerListings}
            refreshing={refreshing}
            onRefresh={onRefresh}
            keyExtractor={(item, i) => item.id ?? i.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.crop}>{item.crop?.name}</Text>
                  <Text style={styles.location}>
                    {item.location?.village} {item.location?.city}
                  </Text>
                  <Text style={styles.price}>₹{item.price}</Text>
                  <Text>
                    {item.quantity} {item.unit}
                  </Text>

                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      setSelectedListing(item);
                      setShowModal(true);
                    }}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>

                <Image
                  source={{ uri: item.photoUrl || FALLBACK_IMAGE }}
                  style={styles.cardImage}
                />
              </View>
            )}
          />
        ) : (
          <FlatList
            data={buyerDemands}
            refreshing={refreshing}
            onRefresh={onRefresh}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.empty}>No {demandStatus} demands</Text>
            }
            renderItem={({ item }) => {
              const cropName = cropMap[item.cropId] || "Crop";
              return (
                <View style={styles.demandCard}>
                  <View style={styles.demandHeader}>
                    <Text style={styles.demandCrop}>{cropName}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.row}>
                    <Text>Quantity</Text>
                    <Text>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text>Expected Price</Text>
                    <Text>₹{item.price}</Text>
                  </View>

                  {item.status === "active" && (
                    <TouchableOpacity
                      style={styles.cancelSmall}
                      onPress={() => cancelDemand(item.id)}
                    >
                      <Text style={styles.cancelSmallText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>

      {/* FARMER MODAL */}
      {showModal && selectedListing && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image
              source={{ uri: selectedListing.photoUrl || FALLBACK_IMAGE }}
              style={styles.modalImage}
            />

            <Text style={styles.modalTitle}>{selectedListing.crop?.name}</Text>
            <Text style={styles.modalText}>
              Location: {selectedListing.location?.village}{" "}
              {selectedListing.location?.city}
            </Text>
            <Text style={styles.modalText}>
              Quantity: {selectedListing.quantity} {selectedListing.unit}
            </Text>
            <Text style={styles.modalText}>
              Price: ₹{selectedListing.price}
            </Text>

            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Farmer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  header: { marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", textAlign: "center" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  activeTab: { backgroundColor: "#fff", borderRadius: 12 },
  tabText: { fontWeight: "700" },

  statusTabs: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 10,
  },
  statusTab: { flex: 1, paddingVertical: 8, alignItems: "center" },
  activeStatusTab: { backgroundColor: "#fff", borderRadius: 10 },
  statusText: { fontWeight: "700", color: "#6B7280" },
  activeStatusText: { color: "#111827" },

  addDemand: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  addDemandText: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    marginLeft: 10,
  },

  crop: { fontSize: 16, fontWeight: "700" },
  location: { color: "#6B7280" },
  price: { color: "#2E7D32", fontWeight: "800" },

  viewButton: {
    marginTop: 8,
    backgroundColor: "#16A34A",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewButtonText: { color: "#fff", fontWeight: "700" },

  demandCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  demandHeader: { flexDirection: "row", justifyContent: "space-between" },
  demandCrop: { fontSize: 17, fontWeight: "800" },
  badge: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },

  cancelSmall: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
  },
  cancelSmallText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 16,
    padding: 20,
  },

  modalImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },

  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  modalText: { marginBottom: 6, color: "#374151" },

  contactButton: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  contactButtonText: { color: "#fff", fontWeight: "700" },

  closeButton: { marginTop: 10, alignItems: "center" },
  closeButtonText: { color: "#DC2626", fontWeight: "700" },

  empty: { textAlign: "center", marginTop: 40, color: "#6B7280" },
});
