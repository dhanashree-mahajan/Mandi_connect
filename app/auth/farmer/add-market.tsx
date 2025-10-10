import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddMarket() {
  const router = useRouter();
  const [marketName, setMarketName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [loading, setLoading] = useState(false);

  const handleAddMarket = async () => {
    if (!marketName || !city || !state || !country) {
      Alert.alert("⚠️ Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const payload = { marketName, marketAddress: { city, state, country } };
      const res = await axios.post("https://mandiconnect.onrender.com/farmer/add-market", payload);

      if (res.status === 201 || res.status === 200) {
        Alert.alert("✅ Market added successfully!");
        setMarketName(""); setCity(""); setState(""); setCountry("India");
        router.back(); // back to dashboard
      }
    } catch (err: any) {
      Alert.alert(err.response?.data?.message || "⚠️ Something went wrong");
      console.error("Add Market Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 }}>
            
            {/* Header */}
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#2E7D32", marginBottom: 12, textAlign: "center" }}>🌾 Add Market</Text>
            <Text style={{ fontSize: 14, color: "#4B5563", textAlign: "center", marginBottom: 20 }}>Add new market details to connect with buyers</Text>

            {/* Inputs */}
            {[{ placeholder: "Market Name", value: marketName, onChange: setMarketName },
              { placeholder: "City", value: city, onChange: setCity },
              { placeholder: "State", value: state, onChange: setState },
              { placeholder: "Country", value: country, onChange: setCountry }
            ].map((input, idx) => (
              <TextInput
                key={idx}
                placeholder={input.placeholder}
                value={input.value}
                onChangeText={input.onChange}
                placeholderTextColor="#6B7280"
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  backgroundColor: "#F9FAFB",
                  fontSize: 16,
                  color: "#111827"
                }}
              />
            ))}

            {/* Button */}
            <TouchableOpacity
              onPress={handleAddMarket}
              disabled={loading}
              style={{
                backgroundColor: "#2E7D32",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center"
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                {loading ? "Adding..." : "Add Market"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
