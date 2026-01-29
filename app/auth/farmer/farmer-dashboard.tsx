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
};

const formatEntry = (e: Entry) => ({
  cropName: e.crop?.name || e.cropName || "",

  marketName: e.market?.marketName || e.market?.name || e.marketName || "",

  price: e.price ?? e.rate ?? 0,

  quantity: e.quantity || e.crop?.displayUnit || "",

  status: e.status || "",

  time: e.createdAt ? new Date(e.createdAt).toLocaleString() : "",
});

export default function FarmerDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<"community" | "marketStats">(
    "community",
  );

  const [communityEntries, setCommunityEntries] = useState<Entry[]>([]);
  const [marketStatsEntries, setMarketStatsEntries] = useState<Entry[]>([]);
  const [viewEntry, setViewEntry] = useState<Entry | null>(null);
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getHeaders = async () => ({
    Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
  });

  const fetchCommunity = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/farmer-entries/getAllEntries`, {
        headers: await getHeaders(),
      });
      setCommunityEntries(res.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMarketStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/marketplace/farmer/getAllListing`,
        { headers: await getHeaders() },
      );
      setMarketStatsEntries(res.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    activeTab === "community" ? fetchCommunity() : fetchMarketStats();
  }, [activeTab]);

  const selectedEntry = useMemo(
    () => (viewEntry ? formatEntry(viewEntry) : null),
    [viewEntry],
  );

  const data =
    activeTab === "community" ? communityEntries : marketStatsEntries;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#2E7D32"
            />
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
          contentContainerStyle={{
            paddingBottom: insets.bottom + 120,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                activeTab === "community" ? fetchCommunity : fetchMarketStats
              }
            />
          }
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2E7D32"
              style={{ marginTop: 40 }}
            />
          ) : (
            data.map((entry, idx) => {
              const f = formatEntry(entry);
              return (
                <View
                  key={entry._id || idx}
                  style={[styles.card, width < 360 && styles.cardCompact]}
                >
                  <Text style={styles.price}>₹{f.price}</Text>
                  <Text style={styles.cropName}>{f.cropName}</Text>
                  <Text style={styles.marketName}>{f.marketName}</Text>
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

        {/* MODAL */}
        <Modal visible={!!viewEntry} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{selectedEntry?.cropName}</Text>

              <Text>Market: {selectedEntry?.marketName}</Text>
              <Text>Price: ₹{selectedEntry?.price}</Text>
              <Text>Quantity: {selectedEntry?.quantity}</Text>
              <Text>Status: {selectedEntry?.status}</Text>
              <Text>Posted: {selectedEntry?.time}</Text>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => setViewEntry(null)}
              >
                <Text style={styles.submitText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1 },

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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E7D32",
  },

  toggleContainer: {
    flexDirection: "row",
    marginTop: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
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
    marginHorizontal: 12,
    marginTop: 12,
  },
  cardCompact: { padding: 10 },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },
  cropName: { fontSize: 15, fontWeight: "600" },
  marketName: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },
});
