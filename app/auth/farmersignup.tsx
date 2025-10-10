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

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: keyof FarmerForm, value: string) =>
    setForm({ ...form, [key]: value });

  const handleSignUp = async () => {
    // Required validation
    if (!form.name || !form.email || !form.mobile || !form.password || !form.city || !form.state || !form.country) {
      showAlert("⚠️ Missing fields", "Please fill all required fields.");
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showAlert("⚠️ Invalid email", "Please enter a valid email address.");
      return;
    }

    // Mobile validation
    if (!/^\d{10}$/.test(form.mobile)) {
      showAlert("⚠️ Invalid mobile", "Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email.toLowerCase(),
        mobile: form.mobile,
        password: form.password,
        farmerAddress: {
          city: form.city,
          state: form.state,
          country: form.country,
        },
        farmDetails: {
          farmSize: form.farmSize,
          cropsGrown: form.cropsGrown ? form.cropsGrown.split(",").map(c => c.trim()) : [],
          irrigationType: form.irrigationType,
          soilType: form.soilType,
        },
      };

      const res = await axios.post(
        "https://mandiconnect.onrender.com/farmer/signup",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 201) {
        showAlert("✅ Success", "Farmer registered! Check email for verification.");
        router.replace("/auth/farmerlogin");
      } else {
        showAlert("❌ Registration failed", "Please try again.");
      }
    } catch (e: any) {
      if (e.response?.status === 409) {
        showAlert("⚠️ Already exists", "User with this email or mobile already exists.");
      } else {
        showAlert("⚠️ Error", e.response?.data?.message || "Something went wrong.");
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
  const infoTextStyle: TextStyle = { fontSize: 14, color: "#4b5563", textAlign: "center", marginBottom: 16 };
  const buttonStyle: ViewStyle = { backgroundColor: "#2E7D32", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 4 };

  const inputs: { key: keyof FarmerForm; placeholder: string; secure?: boolean; keyboardType?: any; label: string }[] = [
    { key: "name", placeholder: "Enter full name", label: "Full Name" },
    { key: "email", placeholder: "Enter email", keyboardType: "email-address", label: "Email" },
    { key: "mobile", placeholder: "Enter mobile number", keyboardType: "phone-pad", label: "Mobile Number" },
    { key: "password", placeholder: "Enter password", secure: true, label: "Password" },
    { key: "city", placeholder: "Enter city", label: "City" },
    { key: "state", placeholder: "Enter state", label: "State" },
    { key: "country", placeholder: "Enter country", label: "Country" },
    { key: "farmSize", placeholder: "Enter farm size in acres", keyboardType: "numeric", label: "Farm Size" },
    { key: "cropsGrown", placeholder: "Enter crops separated by comma", label: "Crops Grown" },
    { key: "irrigationType", placeholder: "Enter irrigation type", label: "Irrigation Type" },
    { key: "soilType", placeholder: "Enter soil type", label: "Soil Type" },
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }} keyboardShouldPersistTaps="handled">
          <View style={cardStyle}>
            <Text style={titleStyle}>🌾 Mandi Connect</Text>
            <Text style={subtitleStyle}>Farmer SignUp</Text>
            <Text style={infoTextStyle}>Sign up to access and stay connected with the mandi network.</Text>

            {inputs.map(item => (
              <View key={item.key} style={{ marginBottom: 12, width: "100%" }}>
                <Text style={labelStyle}>{item.label}</Text>
                <View style={inputContainerStyle}>
                  <MaterialCommunityIcons
                    name={item.key === "password" ? (showPassword ? "lock-open-outline" : "lock-outline") : "account-outline"}
                    size={20}
                    color="#6b7280"
                  />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: "#1f2937", fontSize: 16 }}
                    placeholder={item.placeholder}
                    placeholderTextColor="#6b7280"
                    secureTextEntry={item.secure && !showPassword}
                    keyboardType={item.keyboardType}
                    value={form[item.key]}
                    onChangeText={text => update(item.key, text)}
                    autoCapitalize={item.key === "email" || item.key === "password" ? "none" : "sentences"}
                  />
                  {item.key === "password" && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity onPress={handleSignUp} disabled={loading} style={buttonStyle}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Sign Up</Text>}
            </TouchableOpacity>

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
