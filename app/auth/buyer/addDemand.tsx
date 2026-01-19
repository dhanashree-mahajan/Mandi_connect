import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
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

interface Crop {
  id: string;
  name: string;
  type: string;
}

/* ---------- JWT decoder ---------- */
const decodeJwt = (token: string) => {
  const payload = token.split(".")[1];
  const base64 = payload
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
  return JSON.parse(atob(base64));
};

export default function AddDemand() {
  const insets = useSafeAreaInsets();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [market, setMarket] = useState("");

  const [loading, setLoading] = useState(false);

  /* ---------- ADD CROP STATE ---------- */
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [cropName, setCropName] = useState("");
  const [cropType, setCropType] = useState("");
  const [cropVariety, setCropVariety] = useState("");
  const [addingCrop, setAddingCrop] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, []);

  /* ---------- Fetch crops ---------- */
  const fetchCrops = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/getAllCrop`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCrops(
        res.data.map((c: any) => ({
          id: c.id || c._id,
          name: c.name,
          type: c.type,
        })),
      );
    } catch {
      Alert.alert("Failed to load crops");
    }
  };

  /* ---------- Resolve buyerId ---------- */
  const resolveBuyerId = async (): Promise<string> => {
    const stored = await AsyncStorage.getItem("buyerId");
    if (stored) return stored;

    const token = await AsyncStorage.getItem("token");
    const decoded = decodeJwt(token!);
    const email = decoded.sub?.toLowerCase();

    const res = await axios.get(`${BASE_URL}/buyer/getAll`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const buyer = res.data.find(
      (b: any) => (b.email || b.Email || b.userEmail)?.toLowerCase() === email,
    );

    if (!buyer) throw new Error("Buyer not found");

    await AsyncStorage.setItem("buyerId", buyer._id);
    return buyer._id;
  };

  /* ---------- Submit demand ---------- */
  const handleSubmit = async () => {
    if (!selectedCrop || !quantity || !price || !market) {
      Alert.alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      const buyerId = await resolveBuyerId();

      await axios.post(
        `${BASE_URL}/marketplace/buyer/add`,
        {
          BuyerId: buyerId,
          CropId: selectedCrop.id,
          RequiredQuantity: { Value: Number(quantity), Unit: "kg" },
          ExpectedPrice: { Value: Number(price), Currency: "INR" },
          Market: market,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert("Success", "Demand added successfully");
      router.replace("/auth/buyer/buyerdashboard");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- ADD CROP ---------- */
  const handleAddCrop = async () => {
    if (!cropName || !cropType || !cropVariety) {
      Alert.alert("Fill all crop fields");
      return;
    }

    try {
      setAddingCrop(true);
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/addCrop`,
        {
          name: cropName,
          type: cropType,
          variety: cropVariety,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert("Success", "Crop added");

      setCropName("");
      setCropType("");
      setCropVariety("");
      setShowAddCrop(false);
      fetchCrops();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setAddingCrop(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.title}>🌾 Add Demand</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* CROP HEADER */}
        <View style={styles.cropHeader}>
          <Text style={styles.label}>Crop</Text>
          <TouchableOpacity onPress={() => setShowAddCrop(true)}>
            <Text style={styles.addCropText}>+ Add Crop</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {crops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              onPress={() => setSelectedCrop(crop)}
              style={[
                styles.item,
                selectedCrop?.id === crop.id && styles.itemSelected,
              ]}
            >
              <Text>{crop.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Quantity (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Market</Text>
        <TextInput
          style={styles.input}
          value={market}
          onChangeText={setMarket}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "Saving..." : "Submit Demand"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ADD CROP MODAL */}
      {showAddCrop && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Crop</Text>

            <TextInput
              style={styles.input}
              placeholder="Crop name"
              value={cropName}
              onChangeText={setCropName}
            />
            <TextInput
              style={styles.input}
              placeholder="Type (grain / fruit / vegetable / leafy-vegetable)"
              value={cropType}
              onChangeText={setCropType}
            />
            <TextInput
              style={styles.input}
              placeholder="Variety"
              value={cropVariety}
              onChangeText={setCropVariety}
            />

            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.submitButton, { flex: 1, marginRight: 8 }]}
                onPress={handleAddCrop}
              >
                <Text style={styles.submitText}>
                  {addingCrop ? "Saving..." : "Add Crop"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { flex: 1, backgroundColor: "#9CA3AF" },
                ]}
                onPress={() => setShowAddCrop(false)}
              >
                <Text style={styles.submitText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { fontSize: 20, fontWeight: "700" },
  form: { padding: 16 },
  label: { marginTop: 12, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  item: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginRight: 10,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  itemSelected: { borderColor: "#2E7D32", borderWidth: 2 },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },

  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addCropText: { color: "#2E7D32", fontWeight: "700" },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
});
