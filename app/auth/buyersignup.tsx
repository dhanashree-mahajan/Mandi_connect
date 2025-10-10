import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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

// Cross-platform alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

type BuyerForm = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  companyName: string;
  city: string;
  state: string;
  country: string;
  preferredCrops: string;
};

export default function BuyerSignUp() {
  const router = useRouter();
  const [form, setForm] = useState<BuyerForm>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    companyName: "",
    city: "",
    state: "",
    country: "India",
    preferredCrops: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: keyof BuyerForm, value: string) =>
    setForm({ ...form, [key]: value });

  const handleSignUp = async () => {
    // Validation
    if (
      !form.name ||
      !form.email ||
      !form.mobile ||
      !form.password ||
      !form.companyName ||
      !form.city ||
      !form.state ||
      !form.country
    ) {
      showAlert("⚠️ Missing fields", "Please fill all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showAlert("⚠️ Invalid email", "Please enter a valid email address");
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      showAlert("⚠️ Invalid mobile", "Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      // Payload matching backend JSON
      const payload = {
        Name: form.name,
        Mobile: form.mobile,
        Email: form.email.toLowerCase(),
        Password: form.password,
        "Company Name": form.companyName,
        "Company Address": {
          City: form.city,
          State: form.state,
          Country: form.country,
        },
        PreferredCrops: form.preferredCrops
          ? form.preferredCrops.split(",").map((c) => c.trim())
          : [],
      };

      const res = await axios.post(
        "https://mandiconnect.onrender.com/buyer/signup",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      showAlert("✅ Success", res.data.message || "Buyer registered successfully!");
      router.replace("/auth/buyerlogin");
    } catch (error: any) {
      showAlert(
        "⚠️ Registration failed",
        error.response?.data?.message || "Something went wrong"
      );
      console.error("BuyerSignUp error:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputs: {
    key: keyof BuyerForm;
    placeholder: string;
    secure?: boolean;
    keyboardType?: any;
  }[] = [
    { key: "name", placeholder: "Full Name" },
    { key: "email", placeholder: "Email", keyboardType: "email-address" },
    { key: "password", placeholder: "Password", secure: true },
    { key: "mobile", placeholder: "Mobile Number", keyboardType: "phone-pad" },
    { key: "companyName", placeholder: "Company Name" },
    { key: "city", placeholder: "City" },
    { key: "state", placeholder: "State" },
    { key: "country", placeholder: "Country" },
    { key: "preferredCrops", placeholder: "Preferred Crops (comma-separated)" },
  ];

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
            <Text style={styles.subTitle}>Buyer SignUp</Text>
            <Text style={styles.description}>
              Sign up to access and stay connected with the mandi network.
            </Text>

            {inputs.map((item) => (
              <View key={item.key} style={{ marginBottom: 12, width: "100%" }}>
                <Text style={styles.label}>{item.placeholder}</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name={
                      item.key === "password"
                        ? showPassword
                          ? "lock-open-outline"
                          : "lock-outline"
                        : item.key === "email"
                        ? "email-outline"
                        : item.key === "mobile"
                        ? "cellphone"
                        : "account-outline"
                    }
                    size={20}
                    color="#6b7280"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={item.placeholder}
                    placeholderTextColor="#6b7280"
                    secureTextEntry={item.secure && !showPassword}
                    keyboardType={item.keyboardType}
                    value={form[item.key]}
                    onChangeText={(text) => update(item.key, text)}
                    autoCapitalize={
                      item.key === "email" || item.key === "password"
                        ? "none"
                        : "sentences"
                    }
                    autoFocus={item.key === "name"} // Only name gets auto focus
                  />
                  {item.key === "password" && (
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={{ color: "#4b5563" }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/buyerlogin")}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
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
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  loginText: { color: "#2E7D32", fontWeight: "600", marginLeft: 4 },
});
