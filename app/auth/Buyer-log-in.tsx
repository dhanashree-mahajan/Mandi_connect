import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BuyerSignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (loading) return;
    setLoading(true);

    const payload = {
      Email: email,
      Password: password,
    };

    try {
      const response = await axios.post(
        "https://mandiconnect.onrender.com/api/buyer/signup",
        payload
      );

      if (response.status === 200) {
        Alert.alert("Success", "Buyer login in successfully!");
        setEmail("");
        setPassword("");

        // ✅ Navigate to Buyer Login after login
        router.replace("/");
      }
    } catch (error: any) {
      Alert.alert(
        "Sign Up Failed",
        (axios.isAxiosError(error) && error.response?.data?.message) ||
          "Something went wrong"
      );
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
  <Text style={styles.logo}>🌾 Mandi Connect</Text>
  <Text style={styles.title}>Buyer Login</Text>
  <Text style={styles.subtitle}>
    Login to access and stay connected with the mandi network.
  </Text>
</View>


      {/* Email Input */}
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons
          name="email-outline"
          size={20}
          color="#888"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={20}
          color="#888"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <MaterialCommunityIcons
          name="eye-off-outline"
          size={20}
          color="#888"
          style={styles.iconRight}
        />
      </View>

      {/* log in Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loging..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Already have account */}
      <Text style={styles.loginText}>
        Don't have an account?{" "}
        <Text
          style={styles.loginLink}
          onPress={() => router.push("/auth/Buyer-sign-up")}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
}

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
  button: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loginText: {
    marginTop: 20,
    fontSize: 14,
    color: "#333",
  },
  loginLink: {
    color: "#2d6a4f",
    fontWeight: "600",
  },
});

