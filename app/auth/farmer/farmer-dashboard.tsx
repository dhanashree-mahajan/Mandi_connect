import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function FarmerDashboard() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<"market" | "community">("market");
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  // When user taps "Community" on an entry, we keep track so that the
  // UI can show the community results but still use same layout.
  const [isCommunityView, setIsCommunityView] = useState(false);
  const [communityFor, setCommunityFor] = useState<{ cropId: string; marketId: string } | null>(null);

  const BASE_URL = "https://mandiconnect.onrender.com";

  // fetch either all entries, or user's entries (by farmer id).
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const farmerId = await AsyncStorage.getItem("userId");

      if (!token) {
        console.warn("⚠️ No token found in AsyncStorage");
        setLoading(false);
        return;
      }

      if (!farmerId) {
        console.warn("⚠️ No userId found in AsyncStorage");
        setLoading(false);
        return;
      }

      let endpoint = "";
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Market tab shows all entries
      if (activeTab === "market") {
        endpoint = `${BASE_URL}/farmer-entries/getAllEntries`;
        setIsCommunityView(false);
        setCommunityFor(null);
      } else {
        // Community tab (as per your design) — show that farmer's own entries
        endpoint = `${BASE_URL}/farmer-entries/getByFarmerId/${farmerId}`;
        setIsCommunityView(false);
        setCommunityFor(null);
      }

      const response = await fetch(endpoint, { headers });
      if (!response.ok) {
        console.error(`❌ API Error: ${response.status}`);
        setMarketData([]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Keep ids so we can fetch community by crop+market later
      const formatted = (data || []).map((item: any) => ({
        raw: item,
        id: item._id || item.id,
        cropId: item.crop?.id || item.crop?._id || item.crop,
        marketId: item.market?.id || item.market?._id || item.market,
        cropName: item.crop?.name || item.cropName || "Unknown Crop",
        market: item.market?.marketName || item.market?.name || "N/A",
        price: item.price || 0,
        quantity: item.quantity || "",
        status: item.status || "active",
        time: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
      }));

      setMarketData(formatted);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setMarketData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    // If currently viewing community results for a crop/market, refresh that
    if (isCommunityView && communityFor) {
      await fetchCommunity(communityFor.cropId, communityFor.marketId);
    } else {
      await fetchMarketData();
    }
  };

  // Fetch community prices for specific crop + market and display them in same UI
  const fetchCommunity = async (cropId: string, marketId: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Auth error", "Missing token. Please login again.");
        setLoading(false);
        return;
      }

      const endpoint = `${BASE_URL}/farmer-entries/getByCropAndMarket/${cropId}/${marketId}`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(endpoint, { headers });
      if (!response.ok) {
        console.error("❌ Community fetch failed:", response.status);
        setMarketData([]);
        setIsCommunityView(false);
        setCommunityFor(null);
        return;
      }

      const data = await response.json();
      const formatted = (data || []).map((item: any) => ({
        raw: item,
        id: item._id || item.id,
        cropId: item.crop?.id || item.crop?._id || item.crop,
        marketId: item.market?.id || item.market?._id || item.market,
        cropName: item.crop?.name || item.cropName || "Unknown Crop",
        market: item.market?.marketName || item.market?.name || "N/A",
        price: item.price || 0,
        quantity: item.quantity || "",
        status: item.status || "active",
        time: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
      }));

      setMarketData(formatted);
      setIsCommunityView(true);
      setCommunityFor({ cropId, marketId });
    } catch (err) {
      console.error("❌ Error fetching community:", err);
      Alert.alert("Error", "Failed to fetch community prices.");
      setMarketData([]);
      setIsCommunityView(false);
      setCommunityFor(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewCommunityFor = (item: any) => {
    const { cropId, marketId } = item;
    if (!cropId || !marketId) {
      Alert.alert("Missing IDs", "This entry is missing crop or market id.");
      return;
    }
    fetchCommunity(cropId, marketId);
  };

  const scrollHeight = Platform.OS === "web" ? height - 200 : undefined;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="leaf" size={26} color="#2E7D32" />
        <Text style={styles.headerTitle}>Farmer’s Hub</Text>
      </View>

      {/* Tabs */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "market" && styles.toggleActive,
          ]}
          onPress={() => {
            setActiveTab("market");
          }}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "market" && styles.toggleTextActive,
            ]}
          >
            All Market Prices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "community" && styles.toggleActive,
          ]}
          onPress={() => {
            setActiveTab("community");
          }}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "community" && styles.toggleTextActive,
            ]}
          >
            Community Prices
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data List */}
      <ScrollView
        style={[styles.scrollContainer, { height: scrollHeight }]}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : marketData.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeTab === "market"
              ? "No market data available."
              : isCommunityView
              ? "No community entries found for this crop/market."
              : "You haven’t added any entries yet."}
          </Text>
        ) : (
          marketData.map((item, index) => (
            <View key={item.id || index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.category}>{item.status}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
              </View>

              <Text style={styles.cropName}>{item.cropName}</Text>
              <Text style={styles.variety}>{item.quantity}</Text>

              <View style={styles.footer}>
                <View style={styles.footerRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#757575" />
                  <Text style={styles.footerText}>{item.market}</Text>
                </View>

                <View style={styles.footerRow}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#757575" />
                  <Text style={styles.footerText}>{item.time}</Text>
                </View>
              </View>

              {/* Small actions row — same visual style, minimal change */}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => handleViewCommunityFor(item)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    backgroundColor: "#fff",
                  }}
                >
                  <Text style={{ color: "#374151", fontSize: 13 }}>View Community</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/auth/farmer/add-crop")}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  toggleText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  toggleTextActive: { color: "#fff" },
  scrollContainer: { flex: 1, marginTop: 12 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    backgroundColor: "#E5E7EB",
    color: "#374151",
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  price: { fontWeight: "700", fontSize: 16, color: "#2E7D32" },
  cropName: { fontSize: 15, fontWeight: "600", marginTop: 4, color: "#111827" },
  variety: { fontSize: 13, color: "#6B7280" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 12, color: "#6B7280" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2E7D32",
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  emptyText: { textAlign: "center", marginTop: 50, color: "#6B7280" },
});
