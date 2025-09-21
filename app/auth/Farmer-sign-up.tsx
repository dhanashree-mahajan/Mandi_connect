import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    city: "",
    state: "",
    country: "India",
    farmSize: "",
    cropsGrown: "",
    irrigationType: "",
    soilType: "",
  });

  const update = (key: string, value: string) =>
    setForm({ ...form, [key]: value });

  const handleSignUp = async () => {
    try {
      const payload = {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        farmerAddress: {
          city: form.city,
          state: form.state,
          country: form.country,
        },
        farmDetails: {
          farmSize: form.farmSize,
          cropsGrown: form.cropsGrown
            ? form.cropsGrown.split(",").map((c) => c.trim())
            : [],
          irrigationType: form.irrigationType,
          soilType: form.soilType,
        },
      };

      const response = await axios.post(
        "https://mandiconnect.onrender.com/farmer/signup",
        payload
      );

      if (response.status === 201) {
        Alert.alert(
          "✅ Success",
          "Farmer registered! Please check your email for verification."
        );
        router.replace("/auth/Farmer-log-in");
      } else {
        Alert.alert("❌ Registration failed. Please try again.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          Alert.alert("⚠️ Email or Mobile already exists!");
        } else {
          const message = error.response?.data || "❌ Registration failed.";
          Alert.alert(message);
        }
      } else {
        Alert.alert("⚠️ Something went wrong. Please try again.");
      }
      console.error("SignUp error:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌾 Mandi Connect</Text>
          <Text style={styles.headerTitle}>Farmer SignUp</Text>
          <Text style={styles.subtitle}>
            Sign up to access and stay connected with the mandi network.
          </Text>
        </View>

        {/* Personal Info */}
        <Text style={styles.label}>Personal Information</Text>
        <InputBox
          placeholder="Name"
          value={form.name}
          onChangeText={(t) => update("name", t)}
        />
        <InputBox
          placeholder="Email"
          value={form.email}
          onChangeText={(t) => update("email", t)}
          keyboardType="email-address"
        />
        <InputBox
          placeholder="Mobile"
          value={form.mobile}
          onChangeText={(t) => update("mobile", t)}
          keyboardType="numeric"
        />
        <InputBox
          placeholder="Password"
          value={form.password}
          onChangeText={(t) => update("password", t)}
          secureTextEntry
        />

        {/* Farmer Address */}
        <Text style={styles.label}>Farmer Address</Text>
        <InputBox
          placeholder="City"
          value={form.city}
          onChangeText={(t) => update("city", t)}
        />
        <InputBox
          placeholder="State"
          value={form.state}
          onChangeText={(t) => update("state", t)}
        />
        <InputBox
          placeholder="Country"
          value={form.country}
          onChangeText={(t) => update("country", t)}
        />

        {/* Farm Details */}
        <Text style={styles.label}>Farm Details</Text>
        <InputBox
          placeholder="Farm Size (acres)"
          value={form.farmSize}
          onChangeText={(t) => update("farmSize", t)}
          keyboardType="numeric"
        />
        <InputBox
          placeholder="Crops Grown (comma-separated)"
          value={form.cropsGrown}
          onChangeText={(t) => update("cropsGrown", t)}
        />
        <InputBox
          placeholder="Irrigation Type"
          value={form.irrigationType}
          onChangeText={(t) => update("irrigationType", t)}
        />
        <InputBox
          placeholder="Soil Type"
          value={form.soilType}
          onChangeText={(t) => update("soilType", t)}
        />

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Already have account */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/Farmer-log-in")}>
            <Text style={styles.footerLink}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

type InputBoxProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
};

const InputBox = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
}: InputBoxProps) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    placeholderTextColor="#777"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
  />
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  headerTitle: {
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

  card: {
    width: "85%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: "#fafafa",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: { color: "white", fontSize: 15, fontWeight: "600" },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  footerLink: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
});

