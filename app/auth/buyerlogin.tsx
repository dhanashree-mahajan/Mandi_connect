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

/* ---------- ALERT ---------- */
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function BuyerLogin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      showAlert("Missing fields", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://mandiconnect.onrender.com/buyer/login",
        {
          Email: email,
          Password: password,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("loginEmail", email.toLowerCase());
        await AsyncStorage.setItem("role", "buyer");

        showAlert("Success", "Login successful");
        router.replace("/auth/buyer/buyerdashboard");
      }
    } catch (error: unknown) {
      let message = "Invalid email or password";
      const err = error as any;

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          message = err.response.data;
        } else if (typeof err.response.data.message === "string") {
          message = err.response.data.message;
        }
      }

      showAlert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.headerTitle}>🌾 Mandi Connect</Text>
            <Text style={styles.subTitle}>Buyer Login</Text>

            {/* Email */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color="#6b7280"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name={showPassword ? "lock-open-outline" : "lock-outline"}
                  size={20}
                  color="#6b7280"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
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
              onPress={() => router.push("/auth/buyer-forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.button, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Signup */}
            <View style={styles.signupContainer}>
              <Text style={{ color: "#4b5563" }}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/buyersignup")}
              >
                <Text style={styles.signupText}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 8,
  },

  subTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#1f2937",
  },

  forgotText: {
    textAlign: "right",
    color: "#2563eb",
    marginBottom: 16,
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },

  signupText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
});
