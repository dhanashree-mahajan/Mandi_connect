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
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// Cross-platform alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    // @ts-ignore
    import("react-native").then(({ Alert }) => Alert.alert(title, message));
  }
};

export default function FarmerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("⚠️ Missing fields", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://mandiconnect.onrender.com/farmer/login",
        { email: email.toLowerCase(), password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 && response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("userId", response.data["User ID"] || "");
        showAlert("✅ Success", response.data.message);
        router.replace("/auth/farmer/farmer-dashboard");
      } else {
        showAlert("❌ Login failed", "Please try again.");
      }
    } catch (error: any) {
      const msg = error.response?.data;
      showAlert(
        "⚠️ Login failed",
        typeof msg === "string" ? msg : "Invalid email or password"
      );
      console.error("Login error:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const containerStyle: ViewStyle = { flex: 1, backgroundColor: "#f3f4f6" };
  const cardStyle: ViewStyle = {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  };
  const inputContainerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
  };
  const labelStyle: TextStyle = {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  };
  const buttonStyle: ViewStyle = {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  };
  const titleTextStyle: TextStyle = { fontSize: 28, fontWeight: "bold", color: "#2E7D32", textAlign: "center", marginBottom: 8 };
  const subtitleTextStyle: TextStyle = { fontSize: 20, fontWeight: "600", color: "#1f2937", textAlign: "center", marginBottom: 4 };
  const infoTextStyle: TextStyle = { fontSize: 14, color: "#4b5563", textAlign: "center", marginBottom: 16 };

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }} keyboardShouldPersistTaps="handled">
          <View style={cardStyle}>
            <Text style={titleTextStyle}>🌾 Mandi Connect</Text>
            <Text style={subtitleTextStyle}>Farmer Login</Text>
            <Text style={infoTextStyle}>Log in to access and manage your Farmer account.</Text>

            {/* Email Input */}
            <View style={{ marginBottom: 12, width: "100%" }}>
              <Text style={labelStyle}>Email</Text>
              <View style={inputContainerStyle}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#6b7280" />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: "#1f2937" }}
                  placeholder="Enter email"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 12, width: "100%" }}>
              <Text style={labelStyle}>Password</Text>
              <View style={inputContainerStyle}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#6b7280" />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: "#1f2937" }}
                  placeholder="Enter password"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 16 }}>
              <Text style={{ color: "#2E7D32", fontSize: 14 }}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} disabled={loading} style={buttonStyle}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Sign In</Text>}
            </TouchableOpacity>

            {/* Signup Navigation */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12 }}>
              <Text style={{ color: "#4b5563" }}>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/farmersignup")}>
                <Text style={{ color: "#2E7D32", fontWeight: "600", marginLeft: 4 }}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
