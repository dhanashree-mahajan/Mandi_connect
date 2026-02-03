import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

/* ================= TYPES ================= */

type Market = {
  id: string;
  marketName: string;
};

type Crop = {
  id: string;
  name: string;
  displayUnit: string;
};

type Trend = {
  date: string;
  averagePrice: number;
};

type CropStats = {
  crop: Crop;
  mandi: Market;
  dailyStats: {
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    lastUpdated: string;
    isStale: boolean;
  };
  trend: Trend[];
};

/* ================= COMPONENT ================= */

export default function BuyerHome() {
  const insets = useSafeAreaInsets();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [stats, setStats] = useState<CropStats[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketId, setMarketId] = useState<string | null>(null);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const loadCrops = async () => {
    const res = await axios.get(`${BASE_URL}/getAllCrop`, {
      headers: await getHeaders(),
    });
    setCrops(res.data);
  };

  const loadMarket = async () => {
    const res = await axios.get(`${BASE_URL}/getAllMarket`, {
      headers: await getHeaders(),
    });
    setMarketId(res.data[0]?.id ?? null);
  };

  const loadPrices = async (mId: string) => {
    const headers = await getHeaders();
    const requests = crops.map((crop) =>
      axios
        .get(`${BASE_URL}/stats/getByCropIdAndMarketid/${crop.id}/${mId}`, {
          headers,
        })
        .then((res) => res.data)
        .catch(() => null),
    );
    const results = await Promise.all(requests);
    setStats(results.filter(Boolean));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadMarket(), loadCrops()]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (marketId && crops.length) {
      loadPrices(marketId);
    }
  }, [marketId, crops]);

  const onRefresh = useCallback(async () => {
    if (!marketId) return;
    setRefreshing(true);
    await loadPrices(marketId);
    setRefreshing(false);
  }, [marketId, crops]);

  const filteredStats = stats.filter((item) =>
    item.crop.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }: { item: CropStats }) => {
    const d = item.dailyStats;
    const isOpen = expanded[item.crop.id];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.crop}>{item.crop.name}</Text>
            <Text style={styles.market}>{item.mandi.marketName}</Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.price}>₹{d.averagePrice}</Text>
            <Text style={styles.unit}>/{item.crop.displayUnit}</Text>
          </View>
        </View>

        <View style={styles.rangeRow}>
          <Text style={styles.range}>Min ₹{d.minPrice}</Text>
          <Text style={styles.range}>Max ₹{d.maxPrice}</Text>
        </View>

        <Text style={styles.time}>
          Updated {new Date(d.lastUpdated).toLocaleString()}
        </Text>

        <TouchableOpacity
          style={styles.trendToggleBox}
          onPress={() =>
            setExpanded((p) => ({ ...p, [item.crop.id]: !isOpen }))
          }
        >
          <Text style={styles.trendToggle}>
            {isOpen ? "Hide price trend ▲" : "Show price trend ▼"}
          </Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.trendContainer}>
            {item.trend?.map((t, i) => (
              <View key={i} style={styles.trendRow}>
                <Text style={styles.trendDate}>
                  {new Date(t.date).toDateString()}
                </Text>
                <Text style={styles.trendPrice}>₹{t.averagePrice}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌾 Market Prices</Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search crop"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#000000"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredStats}
            renderItem={renderItem}
            keyExtractor={(item) => item.crop.id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  header: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },

  searchBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginBottom: 14,
  },
  searchInput: {
    fontSize: 15,
    color: "#000000",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  crop: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  market: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  priceBox: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: "#16A34A",
  },
  unit: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  range: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },

  time: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },

  trendToggleBox: {
    marginTop: 12,
  },
  trendToggle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },

  trendContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },

  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  trendDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  trendPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
});
