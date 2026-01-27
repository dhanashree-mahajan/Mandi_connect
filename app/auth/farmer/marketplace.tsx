import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

type TabType = "demands" | "listings";

type BuyerDemand = {
  _id?: string;
  CropId?: string;
  Market?: string;
  ExpectedPrice?: { Value?: number };
  RequiredQuantity?: { Value?: number; Unit?: string };
  status?: string;
};

type FarmerListing = {
  _id?: string;
  crop?: { name?: string };
  location?: { village?: string; city?: string };
  price?: number;
  quantity?: number;
  unit?: string;
  status?: string;
};

export default function FarmerMarketplace() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<TabType>("demands");
  const [demands, setDemands] = useState<BuyerDemand[]>([]);
  const [listings, setListings] = useState<FarmerListing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cropMap, setCropMap] = useState<Record<string, string>>({});

  /* ---------- AUTH ---------- */

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Missing token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- LOAD CROPS ---------- */

  const loadCrops = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${BASE_URL}/getAllCrop`, { headers });

      const map: Record<string, string> = {};
      (res.data || []).forEach((c: any) => {
        map[c.id || c._id] = c.name;
      });

      setCropMap(map);
    } catch (err) {
      console.log("Failed to load crops", err);
    }
  };

  /* ---------- BUYER DEMANDS ---------- */

  const fetchBuyerDemands = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const res = await axios.get(`${BASE_URL}/marketplace/buyer/all`, {
        headers,
      });

      setDemands(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Failed to load buyer demands", err);
      setDemands([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- FARMER LISTINGS ---------- */

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const res = await axios.get(
        `${BASE_URL}/marketplace/farmer/getAllListing`,
        { headers },
      );

      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Failed to load listings", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- INIT ---------- */

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    if (activeTab === "demands") {
      fetchBuyerDemands();
    } else {
      fetchMyListings();
    }
  }, [activeTab]);

  /* ---------- RENDER BUYER DEMAND ---------- */

  const renderDemand = ({ item }: { item: BuyerDemand }) => {
    const cropName = (item.CropId && cropMap[item.CropId]) || "Unknown Crop";

    return (
      <View style={styles.card}>
        <Text style={styles.crop}>{cropName}</Text>
        <Text style={styles.market}>Market: {item.Market || "-"}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>₹{item.ExpectedPrice?.Value ?? "-"}</Text>
          <Text style={styles.qty}>
            {item.RequiredQuantity?.Value ?? "-"}{" "}
            {item.RequiredQuantity?.Unit ?? ""}
          </Text>
        </View>

        <Text style={styles.status}>Status: {item.status || "active"}</Text>
      </View>
    );
  };

  /* ---------- RENDER LISTING ---------- */

  const renderListing = ({ item }: { item: FarmerListing }) => {
    const cropName = item.crop?.name || "Unknown Crop";
    const location = [item.location?.village, item.location?.city]
      .filter(Boolean)
      .join(", ");

    return (
      <View style={styles.card}>
        <Text style={styles.crop}>{cropName}</Text>
        <Text style={styles.market}>{location || "Unknown location"}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>₹{item.price ?? "-"}</Text>
          <Text style={styles.qty}>
            {item.quantity ?? "-"} {item.unit ?? ""}
          </Text>
        </View>

        <Text style={styles.status}>Status: {item.status || "active"}</Text>
      </View>
    );
  };

  /* ---------- UI ---------- */

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

      {/* CTA */}
      {activeTab === "listings" && (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/auth/farmer/add-crop")}
        >
          <Text style={styles.primaryBtnText}>+ List Crop for Sale</Text>
        </TouchableOpacity>
      )}

      {/* LIST */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={activeTab === "demands" ? demands : listings}
          renderItem={activeTab === "demands" ? renderDemand : renderListing}
          keyExtractor={(item, index) => (item as any)._id || index.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

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

  primaryBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
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
    marginBottom: 6,
  },

  price: {
    color: "#2E7D32",
    fontWeight: "700",
  },

  qty: {
    fontWeight: "600",
  },

  status: {
    fontSize: 12,
    color: "#374151",
  },
});
