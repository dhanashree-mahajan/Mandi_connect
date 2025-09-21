import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FarmerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("⚠️ Please enter both email and password");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.post(
        "https://mandiconnect.onrender.com/farmer/login",
        { email, password }
      );

      if (response.status === 200 && response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("userId", response.data["User ID"]);
        alert("✅ " + response.data.message);

        router.replace("/");
      } else {
        alert("❌ Login failed. Please try again.");
      }
    } catch (error: any) {
      if (error.response) {
        alert(`❌ ${error.response.data}`);
      } else if (error.request) {
        alert("⚠️ Server not responding. Please try again later.");
      } else {
        alert("⚠️ Unexpected error occurred.");
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
    <View style={styles.header}>
  <Text style={styles.logo}>🌾 Mandi Connect</Text>
  <Text style={styles.title}>Farmer Login</Text>
  <Text style={styles.subtitle}>
    LogIn to access and stay connected with the mandi network.
  </Text>
</View>



      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <MaterialCommunityIcons name="eye-off-outline" size={20} color="#888" style={styles.iconRight} />
      </View>

      <TouchableOpacity>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.signupText}>
        Don’t have an account?{" "}
        <Text
          style={styles.signupLink}
          onPress={() => router.push("/auth/Farmer-sign-up")}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 30,
  },
  
    header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#2E7D32", // green theme for agriculture
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 20,
  },
  hello: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
    color: "#222",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f7f9",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    width: "100%",
  },
  icon: { marginRight: 8 },
  iconRight: { marginLeft: "auto" },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: 20,
    color: "#2d6a4f",
    fontSize: 13,
  },
  button: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  signupText: {
    marginTop: 20,
    fontSize: 14,
    color: "#333",
  },
  signupLink: {
    color: "#08a127ff",
    fontWeight: "600",
  },
});

