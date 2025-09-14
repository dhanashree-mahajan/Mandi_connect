import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", password: "",
    city: "", state: "", country: "",
    farmSize: "", cropsGrown: "", irrigationType: "", soilType: ""
  });

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSignUp = () => {
    alert("Form Submitted ✅");
    router.replace("/auth/sign-in");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🌱 Sign Up</Text>

        <InputBox placeholder="Full Name" value={form.name} onChangeText={t => update("name", t)} />
        <InputBox placeholder="Email" value={form.email} onChangeText={t => update("email", t)} />
        <InputBox placeholder="Mobile" value={form.mobile} onChangeText={t => update("mobile", t)} />
        <InputBox placeholder="Password" value={form.password} onChangeText={t => update("password", t)} secureTextEntry />

        {/* Address */}
        <View style={styles.row}>
          <InputBox small placeholder="City" value={form.city} onChangeText={t => update("city", t)} />
          <InputBox small placeholder="State" value={form.state} onChangeText={t => update("state", t)} />
        </View>
        <InputBox placeholder="Country" value={form.country} onChangeText={t => update("country", t)} />

        {/* Farm details */}
        <View style={styles.row}>
          <InputBox small placeholder="Farm Size" value={form.farmSize} onChangeText={t => update("farmSize", t)} />
          <InputBox small placeholder="Irrigation" value={form.irrigationType} onChangeText={t => update("irrigationType", t)} />
        </View>
        <InputBox placeholder="Crops Grown" value={form.cropsGrown} onChangeText={t => update("cropsGrown", t)} />
        <InputBox placeholder="Soil Type" value={form.soilType} onChangeText={t => update("soilType", t)} />

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/sign-in")}>
          <Text style={styles.link}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

type InputBoxProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  small?: boolean;
};

const InputBox = ({ placeholder, value, onChangeText, secureTextEntry, small }: InputBoxProps) => (
  <TextInput
    style={[styles.input, small && styles.smallInput]}
    placeholder={placeholder}
    placeholderTextColor="#777"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
  />
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f1f8f4", paddingVertical: 15 },
  card: {
    width: "50%",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10, textAlign: "center", color: "#2d6a4f" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: "#fafafa",
    fontSize: 15,
  },
  smallInput: { flex: 1, marginRight: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontSize: 14, fontWeight: "600" },
  link: { textAlign: "center", color: "#007BFF", marginTop: 10, fontSize: 13 },
});

