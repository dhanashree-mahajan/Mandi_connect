import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://mandiconnect.onrender.com";

const Marketplace = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("token");
      await getAllListings(token);
    };
    fetchData();
  }, []);

  const getAllListings = async (token: any) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/marketplace/farmer/getAllListing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (err) {
      console.log("Error fetching listings", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("token");
    await getAllListings(token);
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* Left Image */}
      <Image
        source={{
          uri:
            item.photoUrl && item.photoUrl.startsWith("http")
              ? item.photoUrl
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }}
        style={styles.image}
      />

      {/* Right Content */}
      <View style={styles.info}>
        <Text style={styles.cropName}>{item.crop?.name || "Unknown Crop"}</Text>
        <Text style={styles.price}>₹ {item.price} / {item.unit}</Text>

        <View style={{ marginTop: 4 }}>
          <Text style={styles.detail}>Qty: {item.quantity} {item.unit}</Text>
          <Text style={styles.detail}>📍 {item.location?.city}, {item.location?.state}</Text>
          <Text style={[styles.status, { color: item.status === "active" ? "#2E7D32" : "#FF0000" }]}>
            ● {item.status}
          </Text>
        </View>

        {/* Premium View Button */}
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() =>
            router.push({
              pathname: "/auth/farmer/market-details",
              params: { item: JSON.stringify(item) },
            })
          }
        >
          <Text style={styles.viewBtnText}>View Details</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#2E7D32" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Loading listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#2E7D32" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="storefront" size={30} color="#2E7D32" />
          <Text style={styles.headerTitle}>Farmer Marketplace</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No listings found yet.</Text>}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/auth/farmer/add-market")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 10 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 8,
  },
  backButton: {
    padding: 6,
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

  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginVertical: 8,
    padding: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 10,
  },
  info: { flex: 1, justifyContent: "space-between" },
  cropName: { fontSize: 17, fontWeight: "700", color: "#111" },
  price: { fontSize: 15, fontWeight: "600", color: "#2E7D32", marginTop: 2 },
  detail: { fontSize: 13, color: "#555" },
  status: { fontSize: 12, fontWeight: "600", marginTop: 4 },

  viewBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
  },
  viewBtnText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13.5,
  },

  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2E7D32",
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  emptyText: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#777" },
});

export default Marketplace;
