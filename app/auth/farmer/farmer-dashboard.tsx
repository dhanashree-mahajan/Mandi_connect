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

type ReactionState = {
  type: "like" | "dislike" | null;
  likes: number;
  dislikes: number;
};

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

  const [reactions, setReactions] = useState<Record<string, ReactionState>>({});

  const handleReaction = (id: string, type: "like" | "dislike") => {
    setReactions((prev) => {
      const current = prev[id] || { type: null, likes: 0, dislikes: 0 };

      if (current.type === type) {
        return {
          ...prev,
          [id]: {
            type: null,
            likes: type === "like" ? current.likes - 1 : current.likes,
            dislikes:
              type === "dislike" ? current.dislikes - 1 : current.dislikes,
          },
        };
      }

      return {
        ...prev,
        [id]: {
          type,
          likes:
            type === "like"
              ? current.likes + 1
              : current.type === "like"
                ? current.likes - 1
                : current.likes,
          dislikes:
            type === "dislike"
              ? current.dislikes + 1
              : current.type === "dislike"
                ? current.dislikes - 1
                : current.dislikes,
        },
      };
    });
  };

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
              const key = entry._id ?? `${idx}`;
              const reaction = reactions[key];

              return (
                <View
                  key={key}
                  style={[styles.card, width < 360 && styles.cardCompact]}
                >
                  <Text style={styles.price}>₹{f.price}</Text>
                  <Text style={styles.cropName}>{f.cropName}</Text>
                  <Text style={styles.marketName}>{f.marketName}</Text>
                  <Text style={styles.variety}>{f.quantity}</Text>

                  <View style={styles.cardFooter}>
                    {activeTab === "community" && (
                      <View style={styles.reactionRow}>
                        {/* LIKE */}
                        <TouchableOpacity
                          disabled={reaction?.type === "dislike"}
                          onPress={() => handleReaction(key, "like")}
                          style={styles.reactionItem}
                        >
                          <Text style={styles.countText}>
                            {reaction?.likes ?? 0}
                          </Text>
                          <MaterialCommunityIcons
                            name={
                              reaction?.type === "like"
                                ? "thumb-up"
                                : "thumb-up-outline"
                            }
                            size={20}
                            color={
                              reaction?.type === "like" ? "#2E7D32" : "#6B7280"
                            }
                          />
                        </TouchableOpacity>

                        {/* DISLIKE */}
                        <TouchableOpacity
                          disabled={reaction?.type === "like"}
                          onPress={() => handleReaction(key, "dislike")}
                          style={styles.reactionItem}
                        >
                          <Text style={styles.countText}>
                            {reaction?.dislikes ?? 0}
                          </Text>
                          <MaterialCommunityIcons
                            name={
                              reaction?.type === "dislike"
                                ? "thumb-down"
                                : "thumb-down-outline"
                            }
                            size={20}
                            color={
                              reaction?.type === "dislike"
                                ? "#C62828"
                                : "#6B7280"
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => setViewEntry(entry)}
                    >
                      <Text>View</Text>
                    </TouchableOpacity>
                  </View>
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
    padding: 6,
    borderWidth: 1,
    borderRadius: 6,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  reactionRow: {
    flexDirection: "row",
    gap: 16,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  countText: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
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
