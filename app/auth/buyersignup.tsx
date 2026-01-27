import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
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

const BASE_URL = "https://mandiconnect.onrender.com";

/* ---------- ALERT ---------- */
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

/* ---------- FORM TYPE ---------- */
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scale = width < 360 ? 0.9 : width > 420 ? 1.05 : 1;

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

  const update = (key: keyof BuyerForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignUp = async () => {
    const { name, email, mobile, password, companyName, city, state, country } =
      form;

    if (
      !name ||
      !email ||
      !mobile ||
      !password ||
      !companyName ||
      !city ||
      !state ||
      !country
    ) {
      showAlert("Missing fields", "Please fill all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert("Invalid email", "Please enter a valid email");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      showAlert("Invalid mobile", "Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Name: name,
        Email: email.toLowerCase().trim(),
        Mobile: mobile,
        Password: password,
        "Company Name": companyName,
        "Company Address": {
          City: city,
          State: state,
          Country: country,
        },
        PreferredCrops: form.preferredCrops
          ? form.preferredCrops.split(",").map((c) => c.trim())
          : [],
      };

      const res = await axios.post(`${BASE_URL}/buyer/signup`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      showAlert(
        "Success",
        res.data?.message || "Buyer registered successfully",
      );
      router.replace("/auth/buyerlogin");
    } catch (err: any) {
      showAlert(
        "Registration failed",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
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
            }}
          >
            {/* HEADER */}
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
                fontSize: 18 * scale,
                fontWeight: "600",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Buyer Sign Up
            </Text>

            {/* INPUTS */}
            {[
              { key: "name", label: "Full Name", icon: "account-outline" },
              {
                key: "email",
                label: "Email Address",
                icon: "email-outline",
                keyboardType: "email-address",
              },
              {
                key: "mobile",
                label: "Mobile Number",
                icon: "cellphone",
                keyboardType: "phone-pad",
              },
              {
                key: "password",
                label: "Password",
                icon: "lock-outline",
                secure: true,
              },
              {
                key: "companyName",
                label: "Company Name",
                icon: "office-building-outline",
              },
              { key: "city", label: "City", icon: "map-marker-outline" },
              { key: "state", label: "State", icon: "map-outline" },
              { key: "country", label: "Country", icon: "flag-outline" },
              {
                key: "preferredCrops",
                label: "Preferred Crops",
                icon: "leaf-outline",
              },
            ].map((item: any) => (
              <View key={item.key} style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 14 * scale,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  {item.label}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color="#6b7280"
                    style={{ marginRight: 6 }}
                  />

                  <TextInput
                    placeholder={item.label}
                    secureTextEntry={item.secure && !showPassword}
                    keyboardType={item.keyboardType}
                    autoCapitalize={
                      item.key === "email" || item.key === "password"
                        ? "none"
                        : "sentences"
                    }
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      fontSize: 16 * scale,
                    }}
                    value={form[item.key as keyof BuyerForm]}
                    onChangeText={(text) =>
                      update(item.key as keyof BuyerForm, text)
                    }
                  />

                  {item.key === "password" && (
                    <TouchableOpacity
                      onPress={() => setShowPassword((p) => !p)}
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

            {/* SUBMIT */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              style={{
                backgroundColor: "#2E7D32",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
                marginTop: 10,
                opacity: loading ? 0.7 : 1,
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
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            {/* LOGIN LINK */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 14 * scale }}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/buyerlogin")}>
                <Text
                  style={{
                    fontSize: 14 * scale,
                    color: "#2E7D32",
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
