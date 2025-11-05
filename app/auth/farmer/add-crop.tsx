import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddCropPrice() {
  const router = useRouter();
  const BASE_URL = "https://mandiconnect.onrender.com";

  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace these IDs if you later want to make them dynamic
  const cropId = "68cac82afcd7953ed17a3f1c";
  const marketId = "68cac79cfcd7953ed17a3f18";

  const handleAddPrice = async () => {
    if (!price || !quantity) {
      alert("Please enter both price and quantity");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const farmerId = await AsyncStorage.getItem("userId");

      if (!token || !farmerId) {
        alert("User not logged in properly");
        return;
      }

      const body = {
        farmer: { id: farmerId },
        crop: { id: cropId },
        market: { id: marketId },
        price: Number(price),
        quantity,
        photo:
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        status: "active",
        feedback: {
          agreeCount: 0,
          disagreeCount: 0,
          votedFarmers: [],
        },
      };

      console.log("📤 Sending body:", body);

      const res = await axios.post(`${BASE_URL}/farmer-entries/add`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Add Response:", res.data);
      alert("✅ Crop price added successfully!");
      setPrice("");
      setQuantity("");
    } catch (error: any) {
      console.log("❌ Add Error:", error.response?.data || error.message);
      alert("Error adding price. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* 🔙 Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2E7D32" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.title}>🌾 Add Crop Price</Text>

            {/* 💰 Price Input */}
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="currency-inr" size={20} color="#555" />
              <TextInput
                placeholder="Enter price"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                style={styles.input}
              />
            </View>

            {/* 📦 Quantity Input */}
            <View style={styles.inputBox}>
              <MaterialCommunityIcons
                name="weight-kilogram"
                size={20}
                color="#555"
              />
              <TextInput
                placeholder="Enter quantity (e.g. 15 kg)"
                placeholderTextColor="#999"
                value={quantity}
                onChangeText={setQuantity}
                style={styles.input}
              />
            </View>

            {/* ✅ Submit Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPrice}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add Price</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  backText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 16,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    color: "#111",
  },
  addButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
