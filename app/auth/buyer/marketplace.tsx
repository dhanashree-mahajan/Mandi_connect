import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://mandiconnect.onrender.com";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce";

export default function Marketplace() {
  const router = useRouter();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ---------- Helpers ---------- */

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Missing token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- Fetch farmer listings ---------- */

  const fetchListings = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const res = await axios.get(
        `${BASE_URL}/marketplace/farmer/getAllListing`,
        { headers },
      );

      const activeListings = Array.isArray(res.data)
        ? res.data.filter((item) => item.status === "active")
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

  /* ---------- Search filter ---------- */

  const filteredListings = listings.filter((item) => {
    const text = `${item.crop?.name ?? ""} ${item.location?.city ?? ""}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  /* ---------- Render item ---------- */

  const renderItem = ({ item }: any) => {
    const cropName = item.crop?.name || "Unknown Crop";
    const location = `${item.location?.village}, ${item.location?.city}`;
    const imageUri =
      item.photoUrl && item.photoUrl.trim() !== ""
        ? item.photoUrl
        : FALLBACK_IMAGE;

    return (
      <View style={styles.cardRow}>
        {/* LEFT INFO */}
        <View style={styles.infoSection}>
          <Text style={styles.crop}>{cropName}</Text>
          <Text style={styles.location}>{location}</Text>

          <View style={styles.row}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.qty}>
              {item.quantity} {item.unit}
            </Text>
          </View>

          {/* ADD DEMAND BUTTON */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              router.push({
                pathname: "/auth/buyer/addDemand",
                params: {
                  cropId: item.crop?.id,
                  cropName,
                },
              })
            }
          >
            <Text style={styles.addBtnText}>Add Demand</Text>
          </TouchableOpacity>
        </View>

        {/* RIGHT IMAGE */}
        <Image source={{ uri: imageUri }} style={styles.rightImage} />
      </View>
    );
  };

  /* ---------- UI ---------- */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBox}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#1F2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>🌾 Buyer Marketplace</Text>

        <View style={styles.iconBox} />
      </View>

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
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconBox: {
    width: 40,
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
  },

  /* Search */
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

  /* Card */
  cardRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
    alignItems: "center",
  },

  infoSection: {
    flex: 1,
    paddingRight: 10,
  },

  rightImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },

  crop: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  location: {
    color: "#6B7280",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },

  qty: {
    color: "#374151",
    fontWeight: "600",
  },

  /* Add Demand Button */
  addBtn: {
    marginTop: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 6, // reduced
    paddingHorizontal: 12, // reduced
    borderRadius: 6, // slightly smaller
    alignSelf: "flex-start", // prevents full-width button
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "600", // lighter than 700
    fontSize: 13, // smaller text
  },
});
