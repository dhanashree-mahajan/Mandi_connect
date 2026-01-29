import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

type TabType = "demands" | "listings";

type BuyerDemand = {
  _id?: string;
  CropId?: string;
  market?: any;
  Market?: string;
  ExpectedPrice?: { Value?: number };
  RequiredQuantity?: { Value?: number; Unit?: string };
  status?: string;
};

type FarmerListing = {
  _id?: string;
  crop?: { name?: string };
  market?: any;
  location?: { village?: string; city?: string };
  price?: number;
  quantity?: number;
  unit?: string;
  status?: string;
};

export default function FarmerMarketplace() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("demands");
  const [demands, setDemands] = useState<BuyerDemand[]>([]);
  const [listings, setListings] = useState<FarmerListing[]>([]);
  const [loading, setLoading] = useState(false);

  const [cropMap, setCropMap] = useState<Record<string, string>>({});
  const [viewDemand, setViewDemand] = useState<BuyerDemand | null>(null);
  const [viewListing, setViewListing] = useState<FarmerListing | null>(null);

  /* ---------- AUTH ---------- */

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- LOAD CROPS ---------- */

  const loadCrops = async () => {
    const headers = await getAuthHeaders();
    const res = await axios.get(`${BASE_URL}/getAllCrop`, { headers });

    const map: Record<string, string> = {};
    (res.data || []).forEach((c: any) => {
      map[c._id || c.id] = c.name;
    });
    setCropMap(map);
  };

  /* ---------- FETCH DATA ---------- */

  const fetchBuyerDemands = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const res = await axios.get(`${BASE_URL}/marketplace/buyer/all`, {
        headers,
      });
      setDemands(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const res = await axios.get(
        `${BASE_URL}/marketplace/farmer/getAllListing`,
        { headers },
      );
      setListings(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- INIT ---------- */

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    activeTab === "demands" ? fetchBuyerDemands() : fetchMyListings();
  }, [activeTab]);

  /* ---------- BUYER DEMAND CARD ---------- */

  const renderDemand = ({ item }: { item: BuyerDemand }) => {
    const cropName = cropMap[item.CropId || ""] || "Unknown Crop";
    const marketName =
      item.market?.marketName || item.market?.name || item.Market || "-";

    return (
      <View style={styles.card}>
        <Text style={styles.crop}>{cropName}</Text>
        <Text style={styles.market}>Market: {marketName}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>₹{item.ExpectedPrice?.Value ?? "-"}</Text>
          <Text style={styles.qty}>
            {item.RequiredQuantity?.Value ?? "-"}{" "}
            {item.RequiredQuantity?.Unit ?? ""}
          </Text>
        </View>

        <Text style={styles.status}>Status: {item.status || "active"}</Text>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => setViewDemand(item)}
          >
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ---------- MY LISTING CARD ---------- */

  const renderListing = ({ item }: { item: FarmerListing }) => {
    const location = [item.location?.village, item.location?.city]
      .filter(Boolean)
      .join(", ");

    return (
      <View style={styles.card}>
        <Text style={styles.crop}>{item.crop?.name || "Unknown Crop"}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>₹{item.price ?? "-"}</Text>
          <Text style={styles.qty}>
            {item.quantity ?? "-"} {item.unit ?? ""}
          </Text>
        </View>

        <Text style={styles.status}>Status: {item.status || "active"}</Text>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => setViewListing(item)}
          >
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🌾 Farmer Marketplace</Text>

      {/* TABS */}
      <View style={styles.tabRow}>
        {(["demands", "listings"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "demands" ? "Buyer Demands" : "My Listings"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "listings" && (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/auth/farmer/add-crop")}
        >
          <Text style={styles.primaryBtnText}>+ List Crop for Sale</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" />
      ) : (
        <FlatList
          data={activeTab === "demands" ? demands : listings}
          renderItem={activeTab === "demands" ? renderDemand : renderListing}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* ---------- BUYER DEMAND VIEW ---------- */}
      {viewDemand && (
        <Modal transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {cropMap[viewDemand.CropId || ""] || "Crop"}
              </Text>

              <Text>Market: {viewDemand.market?.marketName || "-"}</Text>
              <Text>
                Expected Price: ₹{viewDemand.ExpectedPrice?.Value ?? "-"}
              </Text>
              <Text>
                Quantity: {viewDemand.RequiredQuantity?.Value ?? "-"}{" "}
                {viewDemand.RequiredQuantity?.Unit ?? ""}
              </Text>
              <Text>Status: {viewDemand.status || "active"}</Text>

              <TouchableOpacity style={styles.contactBtn}>
                <Text style={styles.contactText}>Contact Buyer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setViewDemand(null)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ---------- MY LISTING VIEW ---------- */}
      {viewListing && (
        <Modal transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {viewListing.crop?.name || "Crop"}
              </Text>

              <Text>Price: ₹{viewListing.price ?? "-"}</Text>
              <Text>
                Quantity: {viewListing.quantity ?? "-"} {viewListing.unit ?? ""}
              </Text>
              <Text>Status: {viewListing.status || "active"}</Text>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setViewListing(null)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
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
  activeTab: { backgroundColor: "#2E7D32" },
  tabText: { fontWeight: "700", color: "#2E7D32" },
  activeTabText: { color: "#fff" },

  primaryBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  cardFooter: {
    marginTop: 8,
    alignItems: "flex-start",
  },

  viewBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewText: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },

  crop: { fontSize: 16, fontWeight: "700" },
  market: { color: "#6B7280", marginBottom: 8 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  price: { color: "#2E7D32", fontWeight: "700" },
  qty: { fontWeight: "600" },
  status: { fontSize: 12, color: "#374151" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },

  contactBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  contactText: { color: "#fff", fontWeight: "700" },

  closeBtn: { marginTop: 12, alignItems: "center" },
  closeText: { fontWeight: "700", color: "#2E7D32" },
});
