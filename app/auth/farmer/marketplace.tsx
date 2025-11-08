import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Marketplace = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [farmerId, setFarmerId] = useState("");

  const BASE_URL = "https://mandiconnect.onrender.com"; // ✅ backend base URL
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("token");
      const farmer = await AsyncStorage.getItem("farmerId");
      setFarmerId(farmer || "");
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
      Alert.alert("Error", "Failed to load marketplace listings");
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

  const handleDelete = async (publicId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(`${BASE_URL}/marketplace/farmer/delete?public_id=${publicId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Deleted", "Listing removed successfully");
            onRefresh();
          } catch (err) {
            Alert.alert("Error", "Failed to delete listing");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.photoUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.cropName}>{item.crop?.name || "Unknown Crop"}</Text>
        <Text style={styles.price}>₹ {item.price} / {item.unit}</Text>
        <Text style={styles.detail}>Qty: {item.quantity} {item.unit}</Text>
        <Text style={styles.detail}>
          📍 {item.location?.city}, {item.location?.state}
        </Text>
        <Text style={[styles.status, { color: item.status === "active" ? "#28a745" : "#ff0000" }]}>
          Status: {item.status}
        </Text>
      </View>

      {item.farmer?.id === farmerId && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.publicId)}>
          <MaterialCommunityIcons name="delete-outline" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Header */}
      <Text style={styles.headerTitle}>Farmer Marketplace</Text>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No listings found yet.</Text>}
      />

      {/* ✅ Floating Add Button */}
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
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#2b7a0b",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 10,
  },
  info: {
    marginTop: 8,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "700",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
    marginTop: 2,
  },
  detail: {
    fontSize: 14,
    color: "#555",
  },
  status: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 5,
  },
  deleteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ff4d4d",
    padding: 6,
    borderRadius: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2b7a0b",
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
});

export default Marketplace;
