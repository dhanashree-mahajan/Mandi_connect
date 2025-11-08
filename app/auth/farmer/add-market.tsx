import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://mandiconnect.onrender.com";

export default function AddMarket() {
  const [cropList, setCropList] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedMarket, setSelectedMarket] = useState<string>("");
  const [marketList, setMarketList] = useState<any[]>([]);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [farmerId, setFarmerId] = useState("");

  // Fetch crops, markets, and farmer info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const farmer = await AsyncStorage.getItem("farmerId");
        setFarmerId(farmer || "");

        const [cropRes, marketRes] = await Promise.all([
          axios.get(`${BASE_URL}/crops/getAll`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/market/getAll`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCropList(cropRes.data);
        setMarketList(marketRes.data);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Pick image
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
    } catch (err) {
      console.error("❌ Error picking image:", err);
    }
  };

  // Upload to backend
  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "crop.jpg",
        type: "image/jpeg",
      } as any);

      const res = await axios.post(`${BASE_URL}/marketplace/farmer/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Upload response:", res.data);
      setPhotoUrl(res.data.url);
      Alert.alert("✅ Upload Successful");
    } catch (err: any) {
      console.error("❌ Image upload failed:", err.response?.data || err.message);
      Alert.alert("Upload Error", "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Submit crop listing
  const handleSubmit = async () => {
    if (!selectedCrop || !selectedMarket || !quantity || !price || !photoUrl) {
      Alert.alert("⚠️ Missing Fields", "Please fill all fields");
      return;
    }

    const token = await AsyncStorage.getItem("token");

    const payload = {
      farmer: farmerId,
      crop: selectedCrop,
      market: selectedMarket,
      quantity,
      price: parseFloat(price),
      photo: photoUrl,
      status: "active",
    };

    console.log("📦 Payload to backend:", JSON.stringify(payload, null, 2));

    try {
      const res = await axios.post(`${BASE_URL}/marketplace/farmer/cropListing`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Success response:", res.data);
      Alert.alert("✅ Success", "Crop listing added successfully");
      resetForm();
    } catch (err: any) {
      console.error("❌ Error adding crop:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to add crop to marketplace");
    }
  };

  const resetForm = () => {
    setSelectedCrop("");
    setSelectedMarket("");
    setQuantity("");
    setPrice("");
    setPhotoUrl("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Crop to Marketplace</Text>

      {/* Crop dropdown */}
      <Text style={styles.label}>Select Crop</Text>
      <ScrollView style={styles.dropdown}>
        {cropList.map((crop) => (
          <TouchableOpacity
            key={crop.id}
            onPress={() => setSelectedCrop(crop.id)}
            style={[styles.dropdownItem, selectedCrop === crop.id && styles.selectedItem]}
          >
            <Text>{crop.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Market dropdown */}
      <Text style={styles.label}>Select Market</Text>
      <ScrollView style={styles.dropdown}>
        {marketList.map((mkt) => (
          <TouchableOpacity
            key={mkt.id}
            onPress={() => setSelectedMarket(mkt.id)}
            style={[styles.dropdownItem, selectedMarket === mkt.id && styles.selectedItem]}
          >
            <Text>{mkt.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quantity */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter quantity"
          value={quantity}
          onChangeText={setQuantity}
        />
      </View>

      {/* Price */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
      </View>

      {/* Upload */}
      <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
        <Text style={styles.uploadText}>{photoUrl ? "Change Image" : "Upload Image"}</Text>
      </TouchableOpacity>
      {uploading && <ActivityIndicator size="small" color="#007bff" />}
      {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.imagePreview} /> : null}

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Add to Marketplace</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 15 },
  label: { marginVertical: 8, fontWeight: "600" },
  inputContainer: { marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    maxHeight: 150,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedItem: { backgroundColor: "#d0e8ff" },
  uploadBtn: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  uploadText: { color: "#fff", fontWeight: "600" },
  imagePreview: { width: "100%", height: 180, borderRadius: 10, marginBottom: 15 },
  submitBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontWeight: "700" },
});
