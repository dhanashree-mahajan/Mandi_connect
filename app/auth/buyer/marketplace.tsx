import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce";

/* ---------- TYPES ---------- */
type Listing = {
  status: string;
  price: number;
  quantity: number;
  unit: string;
  photoUrl?: string;
  crop?: { name?: string };
  location?: { village?: string; city?: string };
};

export default function Marketplace() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showModal, setShowModal] = useState(false);

  /* ---------- Auth headers ---------- */
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Missing token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- Fetch listings ---------- */
  const fetchListings = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const res = await axios.get(
        `${BASE_URL}/marketplace/farmer/getAllListing`,
        { headers },
      );

      const activeListings = Array.isArray(res.data)
        ? res.data.filter((item: Listing) => item.status === "active")
        : [];

      setListings(activeListings);
    } catch (err) {
      console.log("Failed to load marketplace", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  /* ---------- Search ---------- */
  const filteredListings = listings.filter((item) => {
    const text = `${item.crop?.name ?? ""} ${item.location?.city ?? ""}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  /* ---------- Render item ---------- */
  const renderItem = ({ item }: { item: Listing }) => {
    const imageUri =
      item.photoUrl && item.photoUrl.trim() !== ""
        ? item.photoUrl
        : FALLBACK_IMAGE;

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.crop}>{item.crop?.name || "Unknown Crop"}</Text>

          <Text style={styles.location}>
            {item.location?.village || item.location?.city
              ? `${item.location?.village ?? ""}, ${item.location?.city ?? ""}`
              : "Unknown location"}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.qty}>
              {item.quantity} {item.unit}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => {
              setSelectedListing(item);
              setShowModal(true);
            }}
          >
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        </View>

        <Image source={{ uri: imageUri }} style={styles.cardImage} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>🌾 Buyer Marketplace</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ADD DEMAND */}
        <TouchableOpacity
          style={styles.addDemand}
          onPress={() => router.push("/auth/buyer/addDemand")}
        >
          <Text style={styles.addDemandText}>Add Demand +</Text>
        </TouchableOpacity>

        {/* SEARCH */}
        <TextInput
          placeholder="Search by crop or city"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* LIST */}
        {loading ? (
          <Text style={styles.loading}>Loading listings...</Text>
        ) : (
          <FlatList
            data={filteredListings}
            renderItem={renderItem}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 120,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* MODAL */}
      {showModal && selectedListing && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>
                  {selectedListing.crop?.name || "Unknown Crop"}
                </Text>

                <Text style={styles.modalLocation}>
                  {selectedListing.location?.village ||
                  selectedListing.location?.city
                    ? `${selectedListing.location?.village ?? ""}, ${
                        selectedListing.location?.city ?? ""
                      }`
                    : "Unknown location"}
                </Text>

                <Text style={styles.modalPrice}>₹{selectedListing.price}</Text>

                <Text style={styles.modalQty}>
                  {selectedListing.quantity} {selectedListing.unit}
                </Text>
              </View>

              <Image
                source={{
                  uri:
                    selectedListing.photoUrl &&
                    selectedListing.photoUrl.trim() !== ""
                      ? selectedListing.photoUrl
                      : FALLBACK_IMAGE,
                }}
                style={styles.modalImage}
              />
            </View>

            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() =>
                Alert.alert(
                  "Contact Farmer",
                  "Farmer contact will be available soon",
                )
              }
            >
              <Text style={styles.contactText}>Contact Farmer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setShowModal(false);
                setSelectedListing(null);
              }}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
  },
  addDemand: {
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  addDemandText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loading: {
    textAlign: "center",
    marginTop: 30,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 14,
    padding: 14,
    alignItems: "center",
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 12,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  crop: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  location: {
    color: "#6B7280",
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E7D32",
  },
  qty: {
    fontWeight: "600",
  },
  viewBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewBtnText: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 13,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
  },
  modalTop: {
    flexDirection: "row",
    marginBottom: 16,
  },
  modalInfo: {
    flex: 1,
    paddingRight: 12,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  modalLocation: {
    color: "#6B7280",
    marginBottom: 12,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E7D32",
  },
  modalQty: {
    fontWeight: "600",
    marginTop: 4,
  },
  contactBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  contactText: {
    color: "#fff",
    fontWeight: "700",
  },
  closeBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  closeText: {
    fontWeight: "700",
  },
});
