import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ---------- ALERT ---------- */
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function FarmerLogin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scale = width < 360 ? 0.9 : width > 420 ? 1.05 : 1;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      showAlert("Missing fields", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://mandiconnect.onrender.com/farmer/login",
        {
          email: email.toLowerCase(),
          password,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data?.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("role", "farmer");

        showAlert("Success", "Login successful");
        router.replace("/auth/farmer/farmer-dashboard");
      }
    } catch (error: unknown) {
      const err = error as any;
      showAlert(
        "Login Failed",
        err.response?.data?.message || "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 400,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 28 * scale,
                fontWeight: "bold",
                color: "#2E7D32",
                textAlign: "center",
              }}
            >
              🌾 Mandi Connect
            </Text>

            <Text
              style={{
                fontSize: 20 * scale,
                fontWeight: "600",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Farmer Login
            </Text>

            {/* Email */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14 * scale, fontWeight: "600" }}>
                Email
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  marginTop: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color="#6b7280"
                />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    fontSize: 16 * scale,
                  }}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14 * scale, fontWeight: "600" }}>
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  marginTop: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#6b7280"
                />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    fontSize: 16 * scale,
                  }}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/auth/forgot-password")}
              style={{ alignSelf: "flex-end", marginBottom: 16 }}
            >
              <Text
                style={{
                  color: "#2E7D32",
                  fontSize: 13 * scale,
                  fontWeight: "600",
                }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: "#2E7D32",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16 * scale,
                    fontWeight: "600",
                  }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 14 * scale }}>
                Don’t have an account?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/farmersignup")}
              >
                <Text
                  style={{
                    fontSize: 14 * scale,
                    color: "#2E7D32",
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
