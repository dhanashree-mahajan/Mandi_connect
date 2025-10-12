import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const API_BASE = "https://mandiconnect.onrender.com";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

export default function AddPriceScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");

  const [errors, setErrors] = useState({
    crop: false,
    market: false,
    price: false,
  });

  // Fetch crop & market lists
  useEffect(() => {
    (async () => {
      try {
        const [cropRes, marketRes] = await Promise.all([
          axios.get(`${API_BASE}/crops`),
          axios.get(`${API_BASE}/markets`),
        ]);
        setCrops(cropRes.data || []);
        setMarkets(marketRes.data || []);
      } catch (error) {
        console.error("Error fetching lists:", error);
        showAlert("Error", "Failed to load crop or market lists.");
      }
    })();
  }, []);

  const validate = () => {
    const newErrors = {
      crop: !selectedCrop,
      market: !selectedMarket,
      price: !price,
    };
    setErrors(newErrors);
    return !(newErrors.crop || newErrors.market || newErrors.price);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/prices/add`, {
        crop: selectedCrop,
        market: selectedMarket,
        price: Number(price),
        unit,
      });

      showAlert("✅ Success", "Price added successfully!");
      router.back();
    } catch (error) {
      console.error("Error submitting price:", error);
      showAlert("⚠️ Error", "Unable to submit price at this time.");
    } finally {
      setLoading(false);
    }
  };

  const addNewCrop = async () => {
    const newCrop = prompt("Enter new crop name:");
    if (newCrop) {
      try {
        await axios.post(`${API_BASE}/crops/add`, { name: newCrop });
        setCrops((prev) => [...prev, newCrop]);
        setSelectedCrop(newCrop);
      } catch {
        showAlert("Error", "Failed to add crop.");
      }
    }
  };

  const addNewMarket = async () => {
    const newMarket = prompt("Enter new market name:");
    if (newMarket) {
      try {
        await axios.post(`${API_BASE}/markets/add`, { name: newMarket });
        setMarkets((prev) => [...prev, newMarket]);
        setSelectedMarket(newMarket);
      } catch {
        showAlert("Error", "Failed to add market.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.headerTitle}>🌾 Mandi Connect</Text>
            <Text style={styles.subTitle}>Add Crop Price</Text>

            {/* Crop Picker */}
            <Text style={styles.label}>Select Crop</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="sprout-outline"
                size={20}
                color="#6b7280"
              />
              <Picker
                style={styles.picker}
                selectedValue={selectedCrop}
                onValueChange={(itemValue) =>
                  itemValue === "add_new"
                    ? addNewCrop()
                    : setSelectedCrop(itemValue)
                }
              >
                <Picker.Item label="-- Select Crop --" value="" />
                {crops.map((crop, i) => (
                  <Picker.Item key={i} label={crop} value={crop} />
                ))}
                <Picker.Item label="+ Add New Crop" value="add_new" />
              </Picker>
            </View>
            {errors.crop && <Text style={styles.errorText}>Crop is required</Text>}

            {/* Market Picker */}
            <Text style={styles.label}>Select Market</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="store-outline"
                size={20}
                color="#6b7280"
              />
              <Picker
                style={styles.picker}
                selectedValue={selectedMarket}
                onValueChange={(itemValue) =>
                  itemValue === "add_new"
                    ? addNewMarket()
                    : setSelectedMarket(itemValue)
                }
              >
                <Picker.Item label="-- Select Market --" value="" />
                {markets.map((market, i) => (
                  <Picker.Item key={i} label={market} value={market} />
                ))}
                <Picker.Item label="+ Add New Market" value="add_new" />
              </Picker>
            </View>
            {errors.market && (
              <Text style={styles.errorText}>Market is required</Text>
            )}

            {/* Price Input */}
            <Text style={styles.label}>Enter Price</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="cash"
                size={20}
                color="#6b7280"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
            {errors.price && (
              <Text style={styles.errorText}>Price is required</Text>
            )}

            {/* Unit Picker */}
            <Text style={styles.label}>Select Unit</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="weight-kilogram"
                size={20}
                color="#6b7280"
              />
              <Picker
                style={styles.picker}
                selectedValue={unit}
                onValueChange={setUnit}
              >
                <Picker.Item label="Per kg" value="kg" />
                <Picker.Item label="Per quintal" value="quintal" />
                <Picker.Item label="Per ton" value="ton" />
              </Picker>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit Price</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "90%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  picker: { flex: 1 },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
