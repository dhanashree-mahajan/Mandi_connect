import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";
const PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

type Crop = { _id?: string; id?: string; name: string };
type Market = { _id?: string; id?: string; marketName: string };

const cropTypeOptions = [
  { label: "Veg", value: "vegetable" },
  { label: "Fruit", value: "fruit" },
  { label: "Grain", value: "grain" },
  { label: "Leafy", value: "leafy-vegetable" },
];

export default function AddMarket() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [selectedCropId, setSelectedCropId] = useState<string>("");
  const [selectedMarketId, setSelectedMarketId] = useState<string>("");

  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("kg");
  const [price, setPrice] = useState<string>("");

  // ⭐ ADDED VILLAGE FIELD
  const [village, setVillage] = useState<string>("");

  const [city, setCity] = useState<string>("");
  const [stateName, setStateName] = useState<string>("Maharashtra");
  const [country] = useState<string>("India");

  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");

  const [uploading, setUploading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [loadingLists, setLoadingLists] = useState<boolean>(false);

  const [showCropModal, setShowCropModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);

  const [newCropName, setNewCropName] = useState("");
  const [newCropType, setNewCropType] = useState<string>("vegetable");
  const [newCropVariety, setNewCropVariety] = useState("");
  const [savingCrop, setSavingCrop] = useState(false);

  const [newMarketName, setNewMarketName] = useState("");
  const [savingMarket, setSavingMarket] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingLists(true);

        const [token, storedUserId] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("userId"),
        ]);

        setUserId(storedUserId || "");
        await loadLists(token || "");
      } catch {
        Alert.alert("Error", "Failed to load crops or markets.");
      } finally {
        setLoadingLists(false);
      }
    })();
  }, []);

  const loadLists = async (token: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const [cropsRes, marketsRes] = await Promise.all([
      axios.get(`${BASE_URL}/getAllCrop`, { headers }),
      axios.get(`${BASE_URL}/getAllMarket`, { headers }),
    ]);
    setCrops(Array.isArray(cropsRes.data) ? cropsRes.data : []);
    setMarkets(Array.isArray(marketsRes.data) ? marketsRes.data : []);
  };

  const cropId = (c: Crop) => c.id || c._id || "";
  const marketId = (m: Market) => m.id || m._id || "";

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      formData.append("file", {
        uri,
        name: "listing.jpg",
        type: "image/jpeg",
      } as any);

      const res = await axios.post(`${BASE_URL}/marketplace/farmer/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPhotoUrl(res?.data?.url || "");
      setPublicId(res?.data?.public_id || "");
    } catch {
      setPhotoUrl("");
      setPublicId("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCropId) return Alert.alert("Missing", "Please select a crop.");
    if (!quantity || isNaN(Number(quantity))) return Alert.alert("Missing", "Enter valid quantity.");
    if (!unit.trim()) return Alert.alert("Missing", "Enter unit.");
    if (!price || isNaN(Number(price))) return Alert.alert("Missing", "Enter valid price.");

    const token = await AsyncStorage.getItem("token");
    if (!token || !userId) {
      Alert.alert("Auth", "Login again.");
      return;
    }

    const payload: any = {
      farmer: { id: userId },
      crop: { id: selectedCropId },
      quantity: Number(quantity),
      unit: unit.trim().toLowerCase(),
      price: Number(price),
      location: {
        village: village.trim(),   // ⭐ ADDED
        city: city.trim(),
        state: stateName.trim(),
        country,
      },
      photoUrl,
      publicId,
      status: "active",
    };

    if (selectedMarketId) {
      payload.market = { id: selectedMarketId };
    }

    try {
      setSubmitting(true);
      await axios.post(`${BASE_URL}/marketplace/farmer/cropListing`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "Crop listing added.");
      resetForm();
      router.back();
    } catch {
      Alert.alert("Error", "Failed to add listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCropId("");
    setSelectedMarketId("");
    setQuantity("");
    setUnit("kg");
    setPrice("");
    setVillage(""); // ⭐ CLEAR village
    setCity("");
    setStateName("Maharashtra");
    setPhotoUrl("");
    setPublicId("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* HEADER (unchanged) */}
      <SafeAreaView
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.stickyHeaderInner}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2E7D32" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🌾Add Market</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 56 + 12 },
          { paddingBottom: insets.bottom + 20 },
        ]}
      >

        {/* ---- Location ---- */}
        <Text style={styles.sectionTitle}>Location</Text>

        <View style={styles.row}>
          <View style={[styles.inputBox, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sangamner"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={[styles.inputBox, { flex: 1 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={stateName}
              onChangeText={setStateName}
            />
          </View>
        </View>

        {/* ⭐ NEW VILLAGE BOX */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Village</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Manoli"
            value={village}
            onChangeText={setVillage}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={country}
            editable={false}
          />
        </View>

        {/* ---- Upload + Submit (unchanged) ---- */}
        {/* (your image upload and submit code remains the same here) */}

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Add Listing</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

/* ------- STYLES (same) ------- */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F9FAFB" },
  stickyHeader: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 999,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 4,
  },
  stickyHeaderInner: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  backButton: {
    padding: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#2E7D32" },

  sectionTitle: { fontWeight: "700", color: "#111827", marginBottom: 6 },
  row: { flexDirection: "row" },
  inputBox: { marginBottom: 10 },
  label: { marginBottom: 6, fontWeight: "600", color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },

  uploadBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  uploadText: { color: "#fff", fontWeight: "700" },

  submitBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontWeight: "700" },
});
