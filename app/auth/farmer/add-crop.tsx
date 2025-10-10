import { Picker } from "@react-native-picker/picker";
import { BarChart2, Home, Leaf, PlusSquare, User } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddCropScreen() {
  const [cropName, setCropName] = useState("");
  const [cropType, setCropType] = useState("");
  const [cropVariety, setCropVariety] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddCrop = async () => {
    if (!cropName || !cropType || !cropVariety) {
      Alert.alert("⚠️ Validation Error", "Please fill all fields");
      return;
    }

    const payload = { name: cropName, type: cropType, variety: cropVariety };
    setLoading(true);

    try {
      const response = await fetch("https://mandiconnect.onrender.com/addCrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Success", "Crop added successfully!");
        setCropName(""); setCropType(""); setCropVariety("");
      } else {
        Alert.alert("❌ Error", data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("⚠️ Network Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="bg-white rounded-xl p-6 shadow-md">
          {/* Header */}
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#2E7D32", marginBottom: 12, textAlign: "center" }}>
            🌾 Add Crop
          </Text>
          <Text style={{ fontSize: 14, color: "#4B5563", textAlign: "center", marginBottom: 20 }}>
            Add new crop details to make it available for buyers
          </Text>

          {/* Crop Name */}
          <Text className="text-gray-600 mb-1">Crop Name</Text>
          <TextInput
            value={cropName}
            onChangeText={setCropName}
            placeholder="e.g., Wheat"
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 bg-gray-50 text-gray-800"
          />

          {/* Crop Type */}
          <Text className="text-gray-600 mb-1">Crop Type</Text>
          <View className="border border-gray-300 rounded-lg mb-4 bg-gray-50">
            <Picker selectedValue={cropType} onValueChange={(itemValue) => setCropType(itemValue)}>
              <Picker.Item label="Select a crop type" value="" />
              <Picker.Item label="Grain" value="grain" />
              <Picker.Item label="Fruit" value="fruit" />
              <Picker.Item label="Vegetable" value="vegetable" />
              <Picker.Item label="Leafy Vegetable" value="leafy-vegetable" />
            </Picker>
          </View>

          {/* Crop Variety */}
          <Text className="text-gray-600 mb-1">Crop Variety</Text>
          <TextInput
            value={cropVariety}
            onChangeText={setCropVariety}
            placeholder="e.g., Red Carrot"
            className="border border-gray-300 rounded-lg px-4 py-3 mb-6 bg-gray-50 text-gray-800"
          />

          {/* Add Crop Button */}
          <TouchableOpacity
            onPress={handleAddCrop}
            disabled={loading}
            className={`rounded-lg py-3 ${loading ? "bg-gray-400" : "bg-green-700"}`}
          >
            <Text className="text-white font-semibold text-center text-base">
              {loading ? "Adding..." : "Add Crop"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-between border-t border-gray-200 bg-white p-3">
        <TouchableOpacity className="items-center flex-1">
          <Home size={22} color="gray" />
          <Text className="text-xs text-gray-600">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center flex-1">
          <Leaf size={22} color="gray" />
          <Text className="text-xs text-gray-600">My Crops</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center flex-1">
          <PlusSquare size={22} color="green" />
          <Text className="text-xs text-green-600 font-semibold">Add Crop</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center flex-1">
          <BarChart2 size={22} color="gray" />
          <Text className="text-xs text-gray-600">Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center flex-1">
          <User size={22} color="gray" />
          <Text className="text-xs text-gray-600">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
