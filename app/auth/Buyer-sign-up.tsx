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

export default function BuyerSignUp() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [preferredCrops, setPreferredCrops] = useState("");

  const handleSignUp = async () => {
    if (
      !name ||
      !mobile ||
      !email ||
      !password ||
      !companyName ||
      !city ||
      !stateName ||
      !country
    ) {
      Alert.alert("⚠️ Please fill all required fields");
      return;
    }

    try {
      const res = await axios.post(
        "https://mandiconnect.onrender.com/buyer/signup",
        {
          Name: name,
          Mobile: mobile,
          Email: email,
          Password: password,
          "Company Name": companyName,
          "Company Address": {
            City: city,
            State: stateName,
            Country: country,
          },
          PreferredCrops: preferredCrops
            ? preferredCrops.split(",").map((crop) => crop.trim())
            : [],
        }
      );

      Alert.alert("✅ Success", res.data.message);
      router.replace("/auth/Buyer-log-in");
    } catch (error: any) {
      console.error("SignUp Error:", error);
      if (error.response) {
        Alert.alert(
          "❌ Error",
          error.response.data?.message || "Something went wrong"
        );
      } else {
        Alert.alert("⚠️ Server not reachable. Try again.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Logo + Title */}
        <Text style={styles.logo}>🌾 Logo</Text>
        <Text style={styles.title}>Buyer SignUp</Text>
        <Text style={styles.subtitle}>
          Sign up to access your personalized agricultural dashboard.
        </Text>

        {/* Personal Information */}
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Mobile"
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {/* Company Information */}
        <Text style={styles.sectionTitle}>Company Information</Text>
        <TextInput
          placeholder="Company Name"
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
        />

        <View style={styles.row}>
          <TextInput
            placeholder="City"
            style={[styles.input, styles.smallInput]}
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            placeholder="State"
            style={[styles.input, styles.smallInput]}
            value={stateName}
            onChangeText={setStateName}
          />
          <TextInput
            placeholder="Country"
            style={[styles.input, styles.smallInput]}
            value={country}
            onChangeText={setCountry}
          />
        </View>

        <TextInput
          placeholder="Preferred Crops (comma-separated)"
          style={styles.input}
          value={preferredCrops}
          onChangeText={setPreferredCrops}
        />

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Already have an account */}
        <TouchableOpacity
        onPress={() => router.push("/auth/Buyer-log-in")}
        style={{ marginTop: 15, alignSelf: "center" }}
>
  <Text style={{ color: "#2d6a4f", fontWeight: "600" }}>
    Already have an account? Login
  </Text>
</TouchableOpacity>






      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  logo: { textAlign: "center", fontSize: 26, marginBottom: 10, color: "#2d6a4f" },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 5 },
  subtitle: { fontSize: 13, color: "#555", textAlign: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginVertical: 10, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  smallInput: { flex: 1, marginRight: 6 },
  button: {
    backgroundColor: "#2d6a4f",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});



