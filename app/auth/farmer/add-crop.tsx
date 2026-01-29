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
  Modal,
  Platform,
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

/* ---------- TYPES ---------- */
type Crop = { id: string; name: string; type: string; variety?: string };
type Market = { id: string; marketName: string };

/* ---------- CONFIG ---------- */
const BASE_URL = "https://mandiconnect.onrender.com";

/* ---------- ALERT ---------- */
const showAlert = (title: string, message: string) => {
  Platform.OS === "web"
    ? window.alert(`${title}\n${message}`)
    : Alert.alert(title, message);
};

export default function AddFarmerEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  /* ---------- STATE ---------- */
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------- MODALS ---------- */
  const [showCropModal, setShowCropModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);

  const [newCropName, setNewCropName] = useState("");
  const [newCropType, setNewCropType] = useState("");
  const [newCropVariety, setNewCropVariety] = useState("");

  const [newMarketName, setNewMarketName] = useState("");
  const [marketCity, setMarketCity] = useState("");
  const [marketState, setMarketState] = useState("");
  const [marketCountry, setMarketCountry] = useState("");

  /* ---------- LOAD ---------- */
  useEffect(() => {
    fetchCropsAndMarkets();
  }, []);

  const fetchCropsAndMarkets = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

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
          id: c._id || c.id,
          name: c.name,
          type: c.type,
          variety: c.variety,
        })),
      );

      setMarkets(
        marketRes.data.map((m: any) => ({
          id: m._id || m.id,
          marketName: m.marketName,
        })),
      );
    } catch {
      showAlert("Error", "Failed to load data");
    }
  };

  /* ---------- IMAGE ---------- */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return showAlert("Permission denied", "Allow access");

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  /* ---------- ADD CROP ---------- */
  const handleAddCrop = async () => {
    if (!newCropName || !newCropType || !newCropVariety)
      return showAlert("Missing", "Fill all fields");

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/addCrop`,
        { name: newCropName, type: newCropType, variety: newCropVariety },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const crop = {
        id: res.data._id || res.data.id,
        name: res.data.name,
        type: res.data.type,
        variety: res.data.variety,
      };

      setCrops((p) => [...p, crop]);
      setSelectedCrop(crop);
      setShowCropModal(false);
      setNewCropName("");
      setNewCropType("");
      setNewCropVariety("");
    } catch {
      showAlert("Error", "Failed to add crop");
    }
  };

  /* ---------- ADD MARKET ---------- */
  const handleAddMarket = async () => {
    if (!newMarketName || !marketCity || !marketState || !marketCountry)
      return showAlert("Missing", "Fill all fields");

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/addMarket`,
        {
          marketName: newMarketName,
          marketAddress: {
            city: marketCity,
            state: marketState,
            country: marketCountry,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const market = {
        id: res.data._id || res.data.id,
        marketName: res.data.marketName,
      };

      setMarkets((p) => [...p, market]);
      setSelectedMarket(market);
      setShowMarketModal(false);
      setNewMarketName("");
      setMarketCity("");
      setMarketState("");
      setMarketCountry("");
    } catch {
      showAlert("Error", "Failed to add market");
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!selectedCrop || !selectedMarket || !price || !quantity)
      return showAlert("Missing", "Fill all required fields");

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const farmerId = await AsyncStorage.getItem("farmerId");

      const payload = {
        farmer: { id: farmerId },
        crop: { id: selectedCrop.id },
        market: { id: selectedMarket.id },
        price: Number(price),
        quantity: `${quantity} kg`,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      await axios.post(`${BASE_URL}/farmer-entries/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showAlert("Success", "Entry added successfully");
      router.replace("/auth/farmer/farmer-dashboard");
    } catch {
      showAlert("Error", "Failed to submit entry");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#2E7D32"
            />
          </TouchableOpacity>
          <Text style={styles.title}>🌾 Add Crop Entry</Text>
        </View>

        {/* CROP */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Crop</Text>
          <TouchableOpacity onPress={() => setShowCropModal(true)}>
            <Text style={styles.addText}>+ Add Crop</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {crops.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCrop(c)}
              style={[
                styles.chip,
                selectedCrop?.id === c.id && styles.chipActive,
              ]}
            >
              <Text>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MARKET */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Market</Text>
          <TouchableOpacity onPress={() => setShowMarketModal(true)}>
            <Text style={styles.addText}>+Add Market</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {markets.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedMarket(m)}
              style={[
                styles.chip,
                selectedMarket?.id === m.id && styles.chipActive,
              ]}
            >
              <Text>{m.marketName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* INPUTS */}
        <Text style={styles.label}>Price (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Quantity (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <TouchableOpacity onPress={pickImage} style={styles.photoBtn}>
          <Text>{photo ? "Change Photo" : "Upload Photo (optional)"}</Text>
        </TouchableOpacity>

        {photo && <Image source={{ uri: photo }} style={styles.image} />}

        <TouchableOpacity
          style={styles.submit}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Add Entry</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ---------- CROP MODAL ---------- */}
      <Modal visible={showCropModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Crop</Text>
              <TouchableOpacity onPress={() => setShowCropModal(false)}>
                <MaterialCommunityIcons name="close" size={24} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Name"
              style={styles.input}
              value={newCropName}
              onChangeText={setNewCropName}
            />
            <TextInput
              placeholder="Type"
              style={styles.input}
              value={newCropType}
              onChangeText={setNewCropType}
            />
            <TextInput
              placeholder="Variety"
              style={styles.input}
              value={newCropVariety}
              onChangeText={setNewCropVariety}
            />

            <TouchableOpacity style={styles.submit} onPress={handleAddCrop}>
              <Text style={styles.submitText}>Save Crop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------- MARKET MODAL ---------- */}
      <Modal visible={showMarketModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Market</Text>
              <TouchableOpacity onPress={() => setShowMarketModal(false)}>
                <MaterialCommunityIcons name="close" size={24} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Market Name"
              style={styles.input}
              value={newMarketName}
              onChangeText={setNewMarketName}
            />
            <TextInput
              placeholder="City"
              style={styles.input}
              value={marketCity}
              onChangeText={setMarketCity}
            />
            <TextInput
              placeholder="State"
              style={styles.input}
              value={marketState}
              onChangeText={setMarketState}
            />
            <TextInput
              placeholder="Country"
              style={styles.input}
              value={marketCountry}
              onChangeText={setMarketCountry}
            />

            <TouchableOpacity style={styles.submit} onPress={handleAddMarket}>
              <Text style={styles.submitText}>Save Market</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },
  scroll: { padding: 20, maxWidth: 600, alignSelf: "center" },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  title: { flex: 1, textAlign: "center", fontSize: 22, fontWeight: "800" },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 6,
  },
  label: { fontWeight: "700", fontSize: 14 },
  addText: { color: "#2E7D32", fontWeight: "700" },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    marginBottom: 10,
  },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  chipActive: { borderColor: "#2E7D32", borderWidth: 2 },

  photoBtn: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    alignItems: "center",
  },
  image: { height: 200, borderRadius: 10, marginTop: 12 },

  submit: {
    marginTop: 24,
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "92%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
});
