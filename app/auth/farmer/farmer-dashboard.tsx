import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

type Crop = { _id: string; name: string; displayUnit?: string };
type Market = { _id: string; marketName?: string };
type Entry = {
  _id?: string;
  crop?: any;
  cropName?: string;
  market?: any;
  marketName?: string;
  price?: number;
  rate?: number;
  quantity?: string;
  status?: string;
  createdAt?: string;
  [key: string]: any;
};

const computePriceStats = (list: Entry[], cropId?: string) => {
  const prices = list
    .filter((e) => {
      const cid = e.crop?._id || e.crop?.id || e.cropId;
      return !cropId || String(cid) === String(cropId);
    })
    .map((e) => Number(e.price ?? e.rate))
    .filter((p) => !isNaN(p));

  if (!prices.length) return { count: 0, min: 0, avg: 0, max: 0 };

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg =
    Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;

  return { count: prices.length, min, avg, max };
};

const formatEntry = (e: Entry) => ({
  cropName: e.crop?.name || e.cropName || "Unknown Crop",
  marketName: e.market?.marketName || e.marketName || "Unknown Market",
  price: e.price ?? e.rate ?? 0,
  quantity: e.quantity || e.crop?.displayUnit || "",
  status: e.status || "active",
  time: e.createdAt ? new Date(e.createdAt).toLocaleString() : "N/A",
});

export default function FarmerDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<"community" | "marketStats">(
    "community",
  );
  const [filterType, setFilterType] = useState<"all" | "crop" | "market">(
    "all",
  );

  const [communityEntries, setCommunityEntries] = useState<Entry[]>([]);
  const [marketStatsEntries, setMarketStatsEntries] = useState<Entry[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [viewEntry, setViewEntry] = useState<Entry | null>(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getHeaders = async () => ({
    Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
  });

  const fetchCrops = async () => {
    const res = await axios.get(`${BASE_URL}/getAllCrop`, {
      headers: await getHeaders(),
    });
    setCrops(res.data || []);
  };

  const fetchMarkets = async () => {
    const res = await axios.get(`${BASE_URL}/getAllMarket`, {
      headers: await getHeaders(),
    });
    setMarkets(res.data || []);
  };

  const fetchCommunity = async () => {
    setLoading(true);
    const res = await axios.get(`${BASE_URL}/farmer-entries/getAllEntries`, {
      headers: await getHeaders(),
    });
    setCommunityEntries(res.data || []);
    setLoading(false);
    setRefreshing(false);
  };

  const fetchMarketStats = async () => {
    setLoading(true);
    const res = await axios.get(
      `${BASE_URL}/marketplace/farmer/getAllListing`,
      { headers: await getHeaders() },
    );
    setMarketStatsEntries(res.data || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCrops();
    fetchMarkets();
  }, []);

  useEffect(() => {
    if (activeTab === "community") {
      fetchCommunity();
    } else {
      fetchMarketStats();
    }
  }, [activeTab, filterType, selectedCropId, selectedMarketId]);

  const priceStats = useMemo(() => {
    if (!viewEntry) return null;
    const cropId = viewEntry.crop?._id || viewEntry.cropId;
    return computePriceStats(
      [...communityEntries, ...marketStatsEntries],
      String(cropId),
    );
  }, [viewEntry, communityEntries, marketStatsEntries]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#2E7D32" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="sprout" size={34} color="#2E7D32" />
          <Text style={styles.headerTitle}>Farmer’s Hub</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* TABS */}
      <View style={styles.toggleContainer}>
        {["community", "marketStats"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.toggleButton,
              activeTab === t && styles.toggleActive,
            ]}
            onPress={() => setActiveTab(t as any)}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === t && styles.toggleTextActive,
              ]}
            >
              {t === "community" ? "Community Price" : "All Statistics"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SEARCH */}
      {activeTab === "marketStats" && (
        <TextInput
          placeholder="Search crop or market..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.input}
        />
      )}

      {/* LIST */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCommunity} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" />
        ) : (
          (activeTab === "community"
            ? communityEntries
            : marketStatsEntries
          ).map((entry, idx) => {
            const f = formatEntry(entry);
            return (
              <View
                key={entry._id || idx}
                style={[styles.card, width < 360 && { padding: 10 }]}
              >
                <Text style={styles.price}>₹{f.price}</Text>
                <Text style={styles.cropName}>{f.cropName}</Text>
                <Text style={styles.variety}>{f.quantity}</Text>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => setViewEntry(entry)}
                >
                  <Text>View</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(app)/farmer/add-crop")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={!!viewEntry} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{viewEntry?.crop?.name}</Text>

            {priceStats && (
              <>
                <Text>Entries: {priceStats.count}</Text>
                <Text>Min: ₹{priceStats.min}</Text>
                <Text>Avg: ₹{priceStats.avg}</Text>
                <Text>Max: ₹{priceStats.max}</Text>
              </>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => setViewEntry(null)}
            >
              <Text style={styles.submitText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#2E7D32" },

  toggleContainer: { flexDirection: "row", marginTop: 12 },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#2E7D32" },
  toggleText: { color: "#374151" },
  toggleTextActive: { color: "#fff" },

  input: {
    margin: 12,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#D1D5DB",
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    margin: 12,
  },
  price: { fontSize: 16, fontWeight: "700", color: "#2E7D32" },
  cropName: { fontSize: 15, fontWeight: "600" },
  variety: { color: "#6B7280" },

  viewButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    padding: 6,
    borderWidth: 1,
    borderRadius: 6,
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#2E7D32",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  submitButton: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },
});
