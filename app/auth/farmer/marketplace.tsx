import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

type TabType = "demands" | "listings";

export default function FarmerMarketplace() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("demands");
  const [demands, setDemands] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cropMap, setCropMap] = useState<Record<string, string>>({});

  /* ---------- Helpers ---------- */

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Missing token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- Load crops (ID → Name) ---------- */

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

  /* ---------- Buyer Demands ---------- */

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

  /* ---------- Farmer Listings ---------- */

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

  /* ---------- Init ---------- */

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

  /* ---------- Render Buyer Demand ---------- */

  const renderDemand = ({ item }: any) => {
    const cropName = cropMap[item.CropId] || "Unknown Crop";

    return (
      <View style={styles.card}>
        <Text style={styles.crop}>{cropName}</Text>
        <Text style={styles.market}>Market: {item.Market}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>₹{item.ExpectedPrice?.Value}</Text>
          <Text style={styles.qty}>
            {item.RequiredQuantity?.Value} {item.RequiredQuantity?.Unit}
          </Text>
        </View>

        <Text style={styles.status}>Status: {item.status}</Text>
      </View>
    );
  };

  /* ---------- Render My Listing ---------- */

  const renderListing = ({ item }: any) => {
    const cropName = item.crop?.name || "Unknown Crop";
    const location = `${item.location?.village}, ${item.location?.city}`;

    return (
      <View style={styles.card}>
        <Text style={styles.crop}>{cropName}</Text>
        <Text style={styles.market}>{location}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.qty}>
            {item.quantity} {item.unit}
          </Text>
        </View>

        <Text style={styles.status}>Status: {item.status}</Text>
      </View>
    );
  };

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.container}>
      {/* TITLE */}
      <Text style={styles.title}>🌾 Farmer Marketplace</Text>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "demands" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("demands")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "demands" && styles.activeTabText,
            ]}
          >
            Buyer Demands
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "listings" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("listings")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "listings" && styles.activeTabText,
            ]}
          >
            My Listings
          </Text>
        </TouchableOpacity>
      </View>

      {/* PRIMARY CTA */}
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
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={activeTab === "demands" ? demands : listings}
          renderItem={activeTab === "demands" ? renderDemand : renderListing}
          keyExtractor={(item, index) =>
            item._id?.toString() || index.toString()
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
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

  loading: {
    textAlign: "center",
    marginTop: 30,
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
