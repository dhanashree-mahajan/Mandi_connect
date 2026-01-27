import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
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

/* ---------- TYPES ---------- */
type Crop = {
  id: string;
  name: string;
  type: string;
};

type Market = {
  id: string;
  marketName: string;
};

const BASE_URL = "https://mandiconnect.onrender.com";

/* ---------- ALERT ---------- */
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function AddFarmerEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showCropModal, setShowCropModal] = useState(false);
  const [newCropName, setNewCropName] = useState("");
  const [newCropType, setNewCropType] = useState("");

  const [showMarketModal, setShowMarketModal] = useState(false);
  const [newMarketName, setNewMarketName] = useState("");

  useEffect(() => {
    fetchCropsAndMarkets();
  }, []);

  /* ---------- FETCH DATA ---------- */
  const fetchCropsAndMarkets = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return showAlert("Error", "Please login again");

      const [cropRes, marketRes] = await Promise.all([
        axios.get(`${BASE_URL}/getAllCrop`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/getAllMarket`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCrops(
        cropRes.data.map((c: any) => ({
          id: c.id || c._id,
          name: c.name,
          type: c.type,
        })),
      );

      setMarkets(
        marketRes.data.map((m: any) => ({
          id: m.id || m._id,
          marketName: m.marketName,
        })),
      );
    } catch {
      showAlert("Error", "Failed to load data");
    }
  };

  /* ---------- IMAGE PICKER ---------- */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return showAlert("Permission denied", "Allow photo access");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  /* ---------- ADD CROP ---------- */
  const handleAddCrop = async () => {
    if (!newCropName || !newCropType) {
      return showAlert("Missing", "Enter crop name and type");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/addCrop`,
        { name: newCropName, type: newCropType },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const crop = {
        id: res.data.id || res.data._id,
        name: res.data.name,
        type: res.data.type,
      };

      setCrops((prev) => [...prev, crop]);
      setSelectedCrop(crop);
      setShowCropModal(false);
      setNewCropName("");
      setNewCropType("");
    } catch {
      showAlert("Error", "Failed to add crop");
    }
  };

  /* ---------- ADD MARKET ---------- */
  const handleAddMarket = async () => {
    if (!newMarketName) {
      return showAlert("Missing", "Enter market name");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/addMarket`,
        { marketName: newMarketName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const market = {
        id: res.data.id || res.data._id,
        marketName: res.data.marketName,
      };

      setMarkets((prev) => [...prev, market]);
      setSelectedMarket(market);
      setShowMarketModal(false);
      setNewMarketName("");
    } catch {
      showAlert("Error", "Failed to add market");
    }
  };

  /* ---------- SUBMIT (BACKEND-ALIGNED) ---------- */
  const handleSubmit = async () => {
    if (!selectedCrop || !selectedMarket || !price || !quantity) {
      return showAlert("Missing", "Fill all required fields");
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return showAlert("Error", "Please login again");

      const payload = {
        CropId: selectedCrop.id,
        MarketId: selectedMarket.id,
        Price: {
          Value: Number(price),
          Currency: "INR",
        },
        Quantity: {
          Value: Number(quantity),
          Unit: "kg",
        },
        Photo: photo || "",
        Status: "active",
      };

      console.log("FINAL PAYLOAD 👉", payload);

      await axios.post(`${BASE_URL}/farmer-entries/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showAlert("Success", "Entry added successfully");
      router.replace("/auth/farmer/farmer-dashboard");
    } catch (err: any) {
      console.log("SUBMIT ERROR 👉", err.response?.data || err.message);
      showAlert(
        "Error",
        err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          "Failed to submit",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* HEADER */}
        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={() => router.replace("/auth/farmer/farmer-dashboard")}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#2E7D32"
            />
          </TouchableOpacity>
          <Text style={styles.title}>🌾 Add Crop List</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* CROP */}
        <Text style={styles.label}>Crop</Text>
        <ScrollView horizontal>
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

        <TouchableOpacity
          onPress={() => setShowCropModal(true)}
          style={styles.addButton}
        >
          <Text style={styles.addText}>+ Add Crop</Text>
        </TouchableOpacity>

        {/* MARKET */}
        <Text style={styles.label}>Market</Text>
        <ScrollView horizontal>
          {markets.map((market) => (
            <TouchableOpacity
              key={market.id}
              onPress={() => setSelectedMarket(market)}
              style={[
                styles.item,
                selectedMarket?.id === market.id && styles.itemSelected,
              ]}
            >
              <Text>{market.marketName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={() => setShowMarketModal(true)}
          style={styles.addButton}
        >
          <Text style={styles.addText}>+ Add Market</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          placeholder="Quantity (kg)"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
          <Text>{photo ? "Change Photo" : "Upload Photo (optional)"}</Text>
        </TouchableOpacity>

        {photo && <Image source={{ uri: photo }} style={styles.photo} />}

        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Add Entry</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ADD CROP MODAL */}
      {showCropModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <TextInput
              placeholder="Crop name"
              value={newCropName}
              onChangeText={setNewCropName}
              style={styles.input}
            />
            <TextInput
              placeholder="Crop type"
              value={newCropType}
              onChangeText={setNewCropType}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={handleAddCrop}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCropModal(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ADD MARKET MODAL */}
      {showMarketModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <TextInput
              placeholder="Market name"
              value={newMarketName}
              onChangeText={setNewMarketName}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={handleAddMarket}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMarketModal(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  scroll: { padding: 20, maxWidth: 600, alignSelf: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  title: { flex: 1, textAlign: "center", fontSize: 22, fontWeight: "800" },
  label: { fontSize: 16, fontWeight: "600", marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  item: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  itemSelected: { borderColor: "#2E7D32", borderWidth: 2 },
  addButton: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  addText: { color: "#2E7D32", fontWeight: "600" },
  photoButton: {
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  photo: { width: "100%", height: 200, borderRadius: 8, marginBottom: 12 },
  submitButton: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontWeight: "700" },
  modalOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
});
