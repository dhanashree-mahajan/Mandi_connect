import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------- FORM TYPE ---------- */
type FormData = {
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

/* ---------- FIELD CONFIG ---------- */
type FieldConfig = {
  key: keyof FormData;
  label: string;
  placeholder: string;
  secure?: boolean;
};

/* ---------- RESPONSIVE SCALE ---------- */
const { width } = Dimensions.get("window");
const scale = width < 360 ? 0.9 : width > 420 ? 1.05 : 1;

/* ---------- ALERT ---------- */
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}${message ? "\n" + message : ""}`);
  } else {
    Alert.alert(title, message || "");
  }
};

/* ---------- FIELDS ---------- */
const FIELDS: FieldConfig[] = [
  { key: "name", label: "Full Name", placeholder: "Enter your full name" },
  { key: "email", label: "Email Address", placeholder: "Enter your email" },
  {
    key: "mobile",
    label: "Mobile Number",
    placeholder: "10-digit mobile number",
  },
  {
    key: "password",
    label: "Password",
    placeholder: "Create a password",
    secure: true,
  },
  { key: "city", label: "City", placeholder: "Enter city name" },
  { key: "state", label: "State", placeholder: "Enter state name" },
  { key: "country", label: "Country", placeholder: "Enter country" },
  { key: "farmSize", label: "Farm Size", placeholder: "e.g. 5 acres" },
  { key: "cropsGrown", label: "Crops Grown", placeholder: "e.g. Wheat, Rice" },
  {
    key: "irrigationType",
    label: "Irrigation Type",
    placeholder: "e.g. Drip, Canal",
  },
  { key: "soilType", label: "Soil Type", placeholder: "e.g. Loamy, Clay" },
];

export default function FarmerSignUp() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
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

  const update = (key: keyof FormData, value: string) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
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
            padding: 20,
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
              Farmer Sign Up
            </Text>

            {FIELDS.map((field) => (
              <View key={field.key} style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 14 * scale,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  {field.label}
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
                  <TextInput
                    placeholder={field.placeholder}
                    secureTextEntry={field.secure && !showPassword}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      fontSize: 16 * scale,
                    }}
                    value={form[field.key]}
                    onChangeText={(text) => update(field.key, text)}
                  />

                  {field.secure && (
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={{
                backgroundColor: "#2E7D32",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16 * scale,
                  fontWeight: "600",
                }}
              >
                Sign Up
              </Text>
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
              <TouchableOpacity
                onPress={() => router.push("/auth/farmerlogin")}
              >
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
