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

// ⭐ USE ONLY THIS SafeAreaView
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

type Crop = { _id: string; name: string; type?: string; displayUnit?: string };
type Market = { _id: string; marketName?: string; marketAddress?: any };
type Entry = {
  _id?: string;
  id?: string;
  crop?: any;
  cropName?: string;
  cropId?: string;
  market?: any;
  marketName?: string;
  marketId?: string;
  price?: number;
  quantity?: string;
  status?: string;
  createdAt?: string;
  [key: string]: any;
};

const computePriceStats = (list: Entry[], cropId?: string | null) => {
  const filtered = cropId
    ? list.filter((e) => {
        const cid = e.crop?._id || e.crop?.id || e.cropId || e.crop;
        return String(cid) === String(cropId);
      })
    : list;

  const prices = filtered
    .map((e) => Number(e.price ?? e.rate ?? 0))
    .filter((p) => !Number.isNaN(p));

  if (prices.length === 0) return { count: 0, min: 0, avg: 0, max: 0 };

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const sum = prices.reduce((a, b) => a + b, 0);
  const avg = Math.round((sum / prices.length) * 100) / 100;

  return { count: prices.length, min, avg, max };
};

const formatEntry = (item: Entry) => {
  const cropName = item.crop?.name || item.cropName || "Unknown Crop";
  const marketName =
    item.market?.marketName ||
    item.marketName ||
    item.mandi?.name ||
    "Unknown Market";

  const price = item.price ?? item.rate ?? 0;
  const quantity = item.quantity ?? item.crop?.displayUnit ?? "";
  const status = item.status ?? "active";
  const time = item.createdAt
    ? new Date(item.createdAt).toLocaleString()
    : "N/A";

  return { cropName, marketName, price, quantity, status, time };
};

// ⭐ FIXED: removed JSX.Element return type
export default function FarmerDashboard() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<"community" | "marketStats">(
    "community",
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [communityEntries, setCommunityEntries] = useState<Entry[]>([]);
  const [marketStatsEntries, setMarketStatsEntries] = useState<Entry[]>([]);

  const [filterType, setFilterType] = useState<"all" | "crop" | "market">(
    "all",
  );
  const [searchText, setSearchText] = useState<string>("");

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);

  const [viewEntry, setViewEntry] = useState<Entry | null>(null);

  const scrollHeight = height - 200;

  const getAuthHeaders = async (): Promise<{ Authorization: string }> => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Missing token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchCrops = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${BASE_URL}/getAllCrop`, { headers });
      setCrops(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCrops([]);
    }
  };

  const fetchMarkets = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${BASE_URL}/getAllMarket`, { headers });
      setMarkets(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMarkets([]);
    }
  };

  const fetchCommunityEntries = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${BASE_URL}/farmer-entries/getAllEntries`, {
        headers,
      });
      setCommunityEntries(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMarketStatsAll = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const [listingRes, entriesRes] = await Promise.all([
        axios.get(`${BASE_URL}/marketplace/farmer/getAllListing`, {
          headers,
        }),
        axios.get(`${BASE_URL}/farmer-entries/getAllEntries`, {
          headers,
        }),
      ]);

      const merged = [
        ...(Array.isArray(listingRes.data) ? listingRes.data : []),
        ...(Array.isArray(entriesRes.data) ? entriesRes.data : []),
      ];

      setMarketStatsEntries(merged);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMarketStatsByCrop = async (cropId?: string) => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${BASE_URL}/farmer-entries/getAllEntries`, {
        headers,
      });
      const all = Array.isArray(res.data) ? res.data : [];

      const filtered = cropId
        ? all.filter((e: Entry) => {
            const cid = e.crop?._id || e.crop?.id || e.cropId || e.crop;
            return String(cid) === String(cropId);
          })
        : all;

      setMarketStatsEntries(filtered);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMarketStatsByMarket = async (marketId?: string) => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(
        `${BASE_URL}/marketplace/farmer/getAllListing`,
        { headers },
      );
      const all = Array.isArray(res.data) ? res.data : [];

      const filtered = marketId
        ? all.filter((e: Entry) => {
            const mid = e.market?._id || e.market?.id || e.marketId || e.market;
            return String(mid) === String(marketId);
          })
        : all;

      setMarketStatsEntries(filtered);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchCrops(), fetchMarkets()]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (activeTab === "community") {
        await fetchCommunityEntries();
      } else {
        if (filterType === "all") await fetchMarketStatsAll();
        else if (filterType === "crop")
          await fetchMarketStatsByCrop(selectedCropId || undefined);
        else if (filterType === "market")
          await fetchMarketStatsByMarket(selectedMarketId || undefined);
      }
    })();
  }, [activeTab, filterType, selectedCropId, selectedMarketId]);

  const filteredCommunityEntries = useMemo(
    () => communityEntries,
    [communityEntries],
  );

  const filteredMarketStatsEntries = useMemo(() => {
    if (!searchText.trim()) return marketStatsEntries;

    const q = searchText.trim().toLowerCase();

    return marketStatsEntries.filter((e) => {
      const crop = (e.crop?.name || e.cropName || "").toLowerCase();
      const market = (e.market?.marketName || e.marketName || "").toLowerCase();
      return crop.includes(q) || market.includes(q);
    });
  }, [marketStatsEntries, searchText]);

  const onRefresh = async () => {
    setRefreshing(true);

    if (activeTab === "community") await fetchCommunityEntries();
    else {
      if (filterType === "all") await fetchMarketStatsAll();
      else if (filterType === "crop")
        await fetchMarketStatsByCrop(selectedCropId || undefined);
      else if (filterType === "market")
        await fetchMarketStatsByMarket(selectedMarketId || undefined);
    }

    setRefreshing(false);
  };

  const goBack = () => router.back();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* -------------------------------- */}
      {/* Your FULL UI BELOW — UNCHANGED */}
      {/* -------------------------------- */}

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#2E7D32" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <MaterialCommunityIcons size={34} color="#2E7D32" />
          <Text style={styles.headerTitle}>🌾Farmer’s Hub</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}></TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "community" && styles.toggleActive,
          ]}
          onPress={() => {
            setActiveTab("community");
            setFilterType("all");
          }}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "community" && styles.toggleTextActive,
            ]}
          >
            Community Price
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "marketStats" && styles.toggleActive,
          ]}
          onPress={() => {
            setActiveTab("marketStats");
            setFilterType("all");
          }}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "marketStats" && styles.toggleTextActive,
            ]}
          >
            All Statistics
          </Text>
        </TouchableOpacity>
      </View>

      {/* FILTER SECTION */}
      {/* (UNCHANGED — KEEPING YOUR UI EXACTLY SAME) */}
      <View style={{ marginTop: 12 }}>
        {activeTab === "marketStats" && (
          <>
            <TextInput
              placeholder="Search crop or market name..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.input}
            />

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                style={[
                  styles.smallFilter,
                  filterType === "all" && styles.smallFilterActive,
                ]}
                onPress={() => {
                  setFilterType("all");
                  setSelectedCropId(null);
                  setSelectedMarketId(null);
                }}
              >
                <Text
                  style={
                    filterType === "all"
                      ? styles.smallFilterTextActive
                      : styles.smallFilterText
                  }
                >
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.smallFilter,
                  filterType === "crop" && styles.smallFilterActive,
                ]}
                onPress={() => {
                  setFilterType("crop");
                  setSelectedMarketId(null);
                }}
              >
                <Text
                  style={
                    filterType === "crop"
                      ? styles.smallFilterTextActive
                      : styles.smallFilterText
                  }
                >
                  By Crop
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.smallFilter,
                  filterType === "market" && styles.smallFilterActive,
                ]}
                onPress={() => {
                  setFilterType("market");
                  setSelectedCropId(null);
                }}
              >
                <Text
                  style={
                    filterType === "market"
                      ? styles.smallFilterTextActive
                      : styles.smallFilterText
                  }
                >
                  By Market
                </Text>
              </TouchableOpacity>
            </View>

            {/* CROP LIST */}
            {filterType === "crop" && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                {crops.map((c) => (
                  <TouchableOpacity
                    key={c._id}
                    onPress={() => setSelectedCropId(c._id)}
                    style={[
                      styles.pill,
                      selectedCropId === c._id && styles.pillActive,
                    ]}
                  >
                    <Text
                      style={
                        selectedCropId === c._id
                          ? styles.pillTextActive
                          : styles.pillText
                      }
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* MARKET LIST */}
            {filterType === "market" && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                {markets.map((m) => (
                  <TouchableOpacity
                    key={m._id}
                    onPress={() => setSelectedMarketId(m._id)}
                    style={[
                      styles.pill,
                      selectedMarketId === m._id && styles.pillActive,
                    ]}
                  >
                    <Text
                      style={
                        selectedMarketId === m._id
                          ? styles.pillTextActive
                          : styles.pillText
                      }
                    >
                      {m.marketName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </View>

      {/* DATA LIST */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        style={[styles.scrollContainer, { height: scrollHeight }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2E7D32"
            style={{ marginTop: 40 }}
          />
        ) : activeTab === "community" ? (
          filteredCommunityEntries.length === 0 ? (
            <Text style={styles.emptyText}>No community entries found.</Text>
          ) : (
            filteredCommunityEntries.map((entry, idx) => {
              const { cropName, marketName, price, quantity, status, time } =
                formatEntry(entry);

              return (
                <View
                  key={entry._id || idx}
                  style={[styles.card, width < 360 ? { padding: 10 } : {}]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.category}>{status}</Text>
                    <Text style={styles.price}>₹{price}</Text>
                  </View>

                  <Text style={styles.cropName}>{cropName}</Text>
                  <Text style={styles.variety}>{quantity}</Text>

                  <View style={styles.footer}>
                    <View style={styles.footerRow}>
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={14}
                        color="#757575"
                      />
                      <Text style={styles.footerText}>{marketName}</Text>
                    </View>
                    <View style={styles.footerRow}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color="#757575"
                      />
                      <Text style={styles.footerText}>{time}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setViewEntry(entry)}
                    style={styles.viewButton}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )
        ) : filteredMarketStatsEntries.length === 0 ? (
          <Text style={styles.emptyText}>No market statistics found.</Text>
        ) : (
          filteredMarketStatsEntries.map((entry, idx) => {
            const { cropName, marketName, price, quantity, status, time } =
              formatEntry(entry);

            return (
              <View
                key={entry._id || idx}
                style={[styles.card, width < 360 ? { padding: 10 } : {}]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.category}>{status}</Text>
                  <Text style={styles.price}>₹{price}</Text>
                </View>

                <Text style={styles.cropName}>{cropName}</Text>
                <Text style={styles.variety}>{quantity}</Text>

                <View style={styles.footer}>
                  <View style={styles.footerRow}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color="#757575"
                    />
                    <Text style={styles.footerText}>{marketName}</Text>
                  </View>
                  <View style={styles.footerRow}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color="#757575"
                    />
                    <Text style={styles.footerText}>{time}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setViewEntry(entry)}
                  style={styles.viewButton}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/auth/farmer/add-crop")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ENTRY MODAL */}
      <Modal visible={!!viewEntry} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {viewEntry ? viewEntry.crop?.name || viewEntry.cropName : ""}
            </Text>
            <Text>
              Market:{" "}
              {viewEntry
                ? viewEntry.market?.marketName || viewEntry.marketName
                : ""}
            </Text>
            <Text>
              Price: ₹
              {viewEntry ? (viewEntry.price ?? viewEntry.rate ?? 0) : ""}
            </Text>
            <Text>Quantity: {viewEntry ? viewEntry.quantity || "" : ""}</Text>

            {viewEntry &&
              (() => {
                const cropId =
                  viewEntry.crop?._id ||
                  viewEntry.crop?.id ||
                  viewEntry.cropId ||
                  viewEntry.crop;

                const combined = [...communityEntries, ...marketStatsEntries];
                const stats = computePriceStats(combined, String(cropId));

                return (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontWeight: "600" }}>
                      Market summary (all farmers)
                    </Text>
                    <Text>Entries: {stats.count}</Text>
                    <Text>Min: ₹{stats.min}</Text>
                    <Text>Avg: ₹{stats.avg}</Text>
                    <Text>Max: ₹{stats.max}</Text>
                    <Text
                      style={{
                        color: "#6B7280",
                        marginTop: 6,
                      }}
                    >
                      Unit: {viewEntry.crop?.displayUnit || "N/A"}
                    </Text>
                  </View>
                );
              })()}

            <TouchableOpacity
              onPress={() => setViewEntry(null)}
              style={[styles.submitButton, { marginTop: 12 }]}
            >
              <Text style={styles.submitText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
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
  toggleActive: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  toggleText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  toggleTextActive: { color: "#fff" },

  scrollContainer: { marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    borderRadius: 8,
  },

  smallFilter: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  smallFilterActive: { backgroundColor: "#2E7D32" },
  smallFilterText: { color: "#374151" },
  smallFilterTextActive: { color: "#fff" },

  pill: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  pillActive: { borderColor: "#2E7D32", borderWidth: 2 },
  pillText: { color: "#374151" },
  pillTextActive: { color: "#2E7D32", fontWeight: "700" },

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
  price: {
    fontWeight: "700",
    fontSize: 16,
    color: "#2E7D32",
  },
  cropName: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
    color: "#111827",
  },
  variety: { fontSize: 13, color: "#6B7280" },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: { fontSize: 12, color: "#6B7280" },

  viewButton: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  viewButtonText: { color: "#374151", fontSize: 13 },

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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32",
    letterSpacing: 0.5,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#6B7280",
  },

  // Modal
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "92%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  submitButton: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});
