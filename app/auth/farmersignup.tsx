import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}${message ? "\n" + message : ""}`);
  } else {
    Alert.alert(title, message || "");
  }
};

type FarmerForm = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  city: string;
  state: string;
  country: string;
  farmSize: string;
  cropsGrown: string;
  irrigationType: string;
  soilType: string;
};

export default function FarmerSignUp() {
  const router = useRouter();
  const [form, setForm] = useState<FarmerForm>({
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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof FarmerForm, value: string) =>
    setForm({ ...form, [key]: value });

  const handleSignUp = async () => {
    const trimmedForm = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()])
    ) as FarmerForm;

    // Required validation
    if (
      !trimmedForm.name ||
      !trimmedForm.email ||
      !trimmedForm.mobile ||
      !trimmedForm.password ||
      !trimmedForm.city ||
      !trimmedForm.state ||
      !trimmedForm.country
    ) {
      showAlert("⚠️ Missing fields", "Please fill all required fields.");
      return;
    }

    // Email & Mobile validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedForm.email)) {
      showAlert("⚠️ Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(trimmedForm.mobile)) {
      showAlert("⚠️ Invalid mobile", "Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: trimmedForm.name,
        email: trimmedForm.email,
        mobile: trimmedForm.mobile,
        password: trimmedForm.password,
        farmerAddress: {
          city: trimmedForm.city,
          state: trimmedForm.state,
          country: trimmedForm.country,
        },
        farmDetails: {
          farmSize: trimmedForm.farmSize,
          cropsGrown: trimmedForm.cropsGrown
            ? trimmedForm.cropsGrown.split(",").map(c => c.trim())
            : [],
          irrigationType: trimmedForm.irrigationType,
          soilType: trimmedForm.soilType,
        },
      };

      const res = await axios.post(
        "https://mandiconnect.onrender.com/farmer/signup",
        payload,
        { headers: { "Content-Type": "application/json" } }

      );

      console.log("✅ Backend response:", res);

      if (res.status === 201) {
        showAlert("✅ Success", "Farmer registered! Check email for verification.");
        router.replace("/auth/farmerlogin");
      } else {
        console.warn("⚠️ Registration status not 201:", res.status, res.data);
        showAlert("❌ Registration failed", res.data || "Please try again.");
      }
    } catch (e: any) {
      console.error("🔥 Signup error full:", e);

      if (e.response) {
        console.error("💥 Backend error status:", e.response.status);
        console.error("💥 Backend error data:", e.response.data);
        if (e.response.status === 409) {
          showAlert("⚠️ Already exists", "User with this email or mobile already exists.");
        } else {
          showAlert("⚠️ Backend Error", e.response.data || "Something went wrong on server.");
        }
      } else if (e.request) {
        console.error("⚠️ No response from backend:", e.request);
        showAlert(
          "⚠️ Network Error",
          "Cannot reach backend. Check your connection or CORS settings."
        );
      } else {
        console.error("❗ Unexpected error:", e.message);
        showAlert("⚠️ Error", e.message || "Unexpected error occurred.");
      }
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
  const labelStyle: TextStyle = { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4 };
  const titleStyle: TextStyle = { fontSize: 28, fontWeight: "bold", color: "#2E7D32", textAlign: "center", marginBottom: 8 };
  const subtitleStyle: TextStyle = { fontSize: 20, fontWeight: "600", color: "#1f2937", textAlign: "center", marginBottom: 4 };
  const buttonStyle: ViewStyle = { backgroundColor: "#2E7D32", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 4 };

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }} keyboardShouldPersistTaps="handled">
          <View style={cardStyle}>
            <Text style={titleStyle}>🌾 Mandi Connect</Text>
            <Text style={subtitleStyle}>Farmer SignUp</Text>

            {/* Name */}
            <View style={{ marginBottom: 12, width: "100%" }}>
              <Text style={labelStyle}>Full Name</Text>
              <View style={inputContainerStyle}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#6b7280" />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: "#1f2937", fontSize: 16 }}
                  placeholder="Enter full name"
                  value={form.name}
                  onChangeText={(text) => update("name", text)}
                />
              </View>
            </View>

            {/* Email */}
            <View style={{ marginBottom: 12, width: "100%" }}>
              <Text style={labelStyle}>Email</Text>
              <View style={inputContainerStyle}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#6b7280" />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: "#1f2937" }}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(text) => update("email", text)}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Mobile */}
            <View style={{ marginBottom: 12, width: "100%" }}>
              <Text style={labelStyle}>Mobile Number</Text>
              <View style={inputContainerStyle}>
                <MaterialCommunityIcons name="phone-outline" size={20} color="#6b7280" />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: "#1f2937" }}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  value={form.mobile}
                  onChangeText={(text) => update("mobile", text)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 12, width: "100%" }}>
              <Text style={labelStyle}>Password</Text>
              <View style={inputContainerStyle}>
                <MaterialCommunityIcons name={showPassword ? "lock-open-outline" : "lock-outline"} size={20} color="#6b7280" />
                <TextInput
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: "#1f2937" }}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={(text) => update("password", text)}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Other fields */}
            {["city", "state", "country", "farmSize", "cropsGrown", "irrigationType", "soilType"].map((key) => (
              <View key={key} style={{ marginBottom: 12, width: "100%" }}>
                <Text style={labelStyle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <View style={inputContainerStyle}>
                  <MaterialCommunityIcons name="pencil-outline" size={20} color="#6b7280" />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: "#1f2937" }}
                    placeholder={`Enter ${key}`}
                    value={form[key as keyof FarmerForm]}
                    onChangeText={(text) => update(key as keyof FarmerForm, text)}
                  />
                </View>
              </View>
            ))}

            {/* Sign Up Button */}
            <TouchableOpacity onPress={handleSignUp} disabled={loading} style={buttonStyle}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Sign Up</Text>}
            </TouchableOpacity>

            {/* Login Navigation */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12 }}>
              <Text style={{ color: "#4b5563" }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/farmerlogin")}>
                <Text style={{ color: "#2E7D32", fontWeight: "600", marginLeft: 4 }}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
