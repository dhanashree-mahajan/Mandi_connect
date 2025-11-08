import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface Crop {
  id: string;
  name: string;
  type: string;
  displayUnit: string;
  imageUrl?: string;
}

interface Market {
  id: string;
  marketName: string;
  imageUrl?: string;
}

const BASE_URL = "https://mandiconnect.onrender.com";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function AddFarmerEntry() {
  const router = useRouter();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCropModal, setShowCropModal] = useState(false);
  const [newCropName, setNewCropName] = useState("");
  const [newCropType, setNewCropType] = useState("");
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [newMarketName, setNewMarketName] = useState("");

  useEffect(() => {
    fetchCropsAndMarkets();
  }, []);

  const fetchCropsAndMarkets = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Not logged in");

      const [cropRes, marketRes] = await Promise.all([
        axios.get(`${BASE_URL}/getAllCrop`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/getAllMarket`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setCrops(cropRes.data);
      setMarkets(marketRes.data);
    } catch (err: any) {
      console.error(err);
      showAlert("Error", err.message || "Failed to fetch crops/markets");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleAddCrop = async () => {
    if (!newCropName || !newCropType) return showAlert("⚠️ Missing", "Enter crop name and type");
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/addCrop`,
        { name: newCropName, type: newCropType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCrops([...crops, res.data]);
      setSelectedCrop(res.data);
      setShowCropModal(false);
      setNewCropName("");
      setNewCropType("");
    } catch (err) {
      console.error(err);
      showAlert("❌ Error", "Failed to add crop");
    }
  };

  const handleAddMarket = async () => {
    if (!newMarketName) return showAlert("⚠️ Missing", "Enter market name");
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/addMarket`,
        { marketName: newMarketName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMarkets([...markets, res.data]);
      setSelectedMarket(res.data);
      setShowMarketModal(false);
      setNewMarketName("");
    } catch (err) {
      console.error(err);
      showAlert("❌ Error", "Failed to add market");
    }
  };

  const handleSubmit = async () => {
    if (!selectedCrop || !selectedMarket || !price || !quantity) {
      return showAlert("⚠️ Missing fields", "Select crop, market, price & quantity");
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      if (!token || !userId) throw new Error("Not logged in");

      const payload = {
        farmer: { id: userId },
        crop: { id: selectedCrop.id },
        market: { id: selectedMarket.id },
        price: Number(price),
        quantity,
        photo: photo || "",
        status: "active",
        feedback: { agreeCount: 0, disagreeCount: 0, votedFarmers: [] },
      };

      await axios.post(`${BASE_URL}/farmer-entries/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showAlert("✅ Success", "Farmer entry added!");
      setSelectedCrop(null);
      setSelectedMarket(null);
      setPrice("");
      setQuantity("");
      setPhoto(null);
    } catch (err: any) {
      console.error(err);
      showAlert("❌ Error", err.response?.data || "Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Title Row with Back Arrow */}
        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={() => router.replace("/auth/farmer/farmer-dashboard")}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Farmer Entry</Text>
        </View>

        {/* Crop Selection */}
        <Text style={styles.label}>Crop Name:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {crops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              onPress={() => setSelectedCrop(crop)}
              style={[styles.item, selectedCrop?.id === crop.id && styles.itemSelected]}
            >
              {crop.imageUrl && <Image source={{ uri: crop.imageUrl }} style={styles.itemImage} />}
              <Text>{crop.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={() => setShowCropModal(true)} style={styles.addButton}>
          <Text style={styles.addText}>+ Add Crop</Text>
        </TouchableOpacity>

        {/* Market Selection */}
        <Text style={styles.label}>Market Name:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {markets.map((market) => (
            <TouchableOpacity
              key={market.id}
              onPress={() => setSelectedMarket(market)}
              style={[styles.item, selectedMarket?.id === market.id && styles.itemSelected]}
            >
              {market.imageUrl && <Image source={{ uri: market.imageUrl }} style={styles.itemImage} />}
              <Text>{market.marketName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={() => setShowMarketModal(true)} style={styles.addButton}>
          <Text style={styles.addText}>+ Add Market</Text>
        </TouchableOpacity>

        {/* Price & Quantity */}
        <Text style={styles.label}>Price</Text>
        <TextInput value={price} onChangeText={setPrice} placeholder="Enter price" keyboardType="numeric" style={styles.input} />
        <Text style={styles.label}>Quantity</Text>
        <TextInput value={quantity} onChangeText={setQuantity} placeholder="Enter quantity (e.g., 15 kg)" style={styles.input} />

        {/* Photo */}
        <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
          <Text>{photo ? "Change Photo" : "Upload Photo (optional)"}</Text>
        </TouchableOpacity>
        {photo && <Image source={{ uri: photo }} style={styles.photo} />}

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Add Entry</Text>}
        </TouchableOpacity>

        {/* Crop & Market Modals */}
        {/* ... modals code remains same ... */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { padding: 6 }, // increases touchable area
  title: { fontSize: 24, fontWeight: "bold", marginLeft: 10 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", padding: 12, borderRadius: 8, marginBottom: 12 },
  photoButton: { backgroundColor: "#E5E7EB", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  photo: { width: "100%", height: 200, marginBottom: 12, borderRadius: 8 },
  submitButton: { backgroundColor: "#2E7D32", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  submitText: { color: "#fff", fontWeight: "bold" },
  item: { padding: 10, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  itemSelected: { borderColor: "#2E7D32", borderWidth: 2 },
  addButton: { backgroundColor: "#E5E7EB", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  addText: { color: "#2E7D32", fontWeight: "600" },
  itemImage: { width: 40, height: 40, marginBottom: 4, borderRadius: 20 },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: "85%", backgroundColor: "#fff", padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
});
