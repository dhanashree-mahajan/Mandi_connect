import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddDemand() {
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [market, setMarket] = useState("");

  // 🔹 Dummy submit handler
  const handleSubmit = async () => {
    if (!crop || !quantity || !price || !market) {
      Alert.alert("Please fill all fields");
      return;
    }

    // 🟢 In real project — replace this with your API POST request:
    // const response = await fetch("https://mandiconnect.onrender.com/api/buyer-demand/add", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ crop, quantity, price, market }),
    // });

    Alert.alert("Success", "Demand added successfully!");
    router.push("/(buyer)/buyer-dashboard"); // 🔙 Navigate back
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Demand</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      {/* 🔹 Form */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Crop Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter crop name"
          value={crop}
          onChangeText={setCrop}
        />

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter quantity (e.g., 500 kg)"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price (₹/quintal)"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Market</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter market name"
          value={market}
          onChangeText={setMarket}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Demand</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    fontSize: 14,
    color: "#111827",
  },
  submitButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
