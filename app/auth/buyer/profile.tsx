import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

export default function BuyerProfile() {
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    companyName: "",
    city: "",
    state: "",
    country: "",
  });

  /* ---------- Helpers ---------- */

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Missing token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- Load profile ---------- */

  const loadProfile = async () => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem("buyerId");
      if (!id) return;

      setBuyerId(id);

      const headers = await getAuthHeaders();
      const res = await axios.get(`${BASE_URL}/buyer/${id}`, { headers });

      const b = res.data;

      setProfile({
        name: b.name || "",
        email: b.email || "",
        mobile: b.mobile || "",
        companyName: b.companyName || "",
        city: b.companyAddress?.city || "",
        state: b.companyAddress?.state || "",
        country: b.companyAddress?.country || "",
      });
    } catch (err) {
      console.log("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Update profile ---------- */

  const updateProfile = async () => {
    try {
      if (!buyerId) return;

      const headers = await getAuthHeaders();

      const payload = {
        name: profile.name,
        mobile: profile.mobile,
        companyName: profile.companyName,
        companyAddress: {
          city: profile.city,
          state: profile.state,
          country: profile.country,
        },
      };

      await axios.patch(`${BASE_URL}/buyer/update/${buyerId}`, payload, {
        headers,
      });

      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.log("Failed to update profile", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  /* ---------- Logout ---------- */

  const logout = async () => {
    await AsyncStorage.clear();
    Alert.alert("Logged out");
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>👤 My Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={profile.name}
        onChangeText={(t) => setProfile({ ...profile, name: t })}
      />

      <TextInput
        style={[styles.input, styles.disabled]}
        value={profile.email}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile"
        keyboardType="phone-pad"
        value={profile.mobile}
        onChangeText={(t) => setProfile({ ...profile, mobile: t })}
      />

      <TextInput
        style={styles.input}
        placeholder="Company Name"
        value={profile.companyName}
        onChangeText={(t) => setProfile({ ...profile, companyName: t })}
      />

      <TextInput
        style={styles.input}
        placeholder="City"
        value={profile.city}
        onChangeText={(t) => setProfile({ ...profile, city: t })}
      />

      <TextInput
        style={styles.input}
        placeholder="State"
        value={profile.state}
        onChangeText={(t) => setProfile({ ...profile, state: t })}
      />

      <TextInput
        style={styles.input}
        placeholder="Country"
        value={profile.country}
        onChangeText={(t) => setProfile({ ...profile, country: t })}
      />

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={updateProfile}
        disabled={loading}
      >
        <Text style={styles.primaryBtnText}>Update Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  disabled: {
    backgroundColor: "#F3F4F6",
  },

  primaryBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  logoutBtn: {
    marginTop: 20,
    alignItems: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
  },
});
