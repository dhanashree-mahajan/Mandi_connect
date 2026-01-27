import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

type Crop = { _id?: string; id?: string; name: string };
type Market = { _id?: string; id?: string; marketName: string };

export default function AddMarket() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [selectedCropId, setSelectedCropId] = useState("");
  const [selectedMarketId, setSelectedMarketId] = useState("");

  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");

  const [village, setVillage] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Maharashtra");
  const country = "India";

  const [photoUrl, setPhotoUrl] = useState("");
  const [publicId, setPublicId] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [token, storedUserId] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("userId"),
      ]);

      if (!token) throw new Error("Not logged in");

      setUserId(storedUserId || "");

      const headers = { Authorization: `Bearer ${token}` };
      const [cropRes, marketRes] = await Promise.all([
        axios.get(`${BASE_URL}/getAllCrop`, { headers }),
        axios.get(`${BASE_URL}/getAllMarket`, { headers }),
      ]);

      setCrops(cropRes.data || []);
      setMarkets(marketRes.data || []);
    } catch {
      Alert.alert("Error", "Failed to load crops or markets");
    }
  };

  /* ---------- IMAGE PICKER ---------- */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access to continue");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
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

      const res = await axios.post(
        `${BASE_URL}/marketplace/farmer/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setPhotoUrl(res.data?.url || "");
      setPublicId(res.data?.public_id || "");
    } catch {
      Alert.alert("Error", "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!selectedCropId) return Alert.alert("Missing", "Please select a crop");
    if (!quantity || isNaN(Number(quantity)))
      return Alert.alert("Missing", "Enter valid quantity");
    if (!price || isNaN(Number(price)))
      return Alert.alert("Missing", "Enter valid price");

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      if (!token || !userId) throw new Error("Not logged in");

      const payload: any = {
        farmer: { id: userId },
        crop: { id: selectedCropId },
        quantity: Number(quantity),
        unit,
        price: Number(price),
        location: {
          village,
          city,
          state: stateName,
          country,
        },
        photoUrl,
        publicId,
        status: "active",
      };

      if (selectedMarketId) {
        payload.market = { id: selectedMarketId };
      }

      await axios.post(`${BASE_URL}/marketplace/farmer/cropListing`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "Crop listing added");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to add listing");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <SafeAreaView style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <View style={styles.stickyHeaderInner}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#2E7D32"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>🌾 Add Market</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 56 + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Location</Text>

        <View style={styles.row}>
          <View style={[styles.inputBox, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
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

        <View style={styles.inputBox}>
          <Text style={styles.label}>Village</Text>
          <TextInput
            style={styles.input}
            value={village}
            onChangeText={setVillage}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Country</Text>
          <TextInput style={styles.input} value={country} editable={false} />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
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

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    maxWidth: 700,
    alignSelf: "center",
    width: "100%",
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 10,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
  },
  inputBox: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  submitBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
});
