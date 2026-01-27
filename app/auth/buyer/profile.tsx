import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

/* ---------- TYPES ---------- */
type BuyerProfileType = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  companyName: string;
  companyAddress?: {
    city?: string;
    state?: string;
    country?: string;
  };
  preferredCrops?: string[];
  verified?: boolean;
};

export default function BuyerProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [buyer, setBuyer] = useState<BuyerProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      const loginEmail = await AsyncStorage.getItem("loginEmail");
      const cachedProfile = await AsyncStorage.getItem("buyerProfile");

      if (!token || !loginEmail) {
        setError("Session expired. Please login again.");
        return;
      }

      // Use cached profile first
      if (cachedProfile) {
        setBuyer(JSON.parse(cachedProfile));
        return;
      }

      // Backend limitation: get all buyers
      const res = await axios.get(`${BASE_URL}/buyer/getAll`);

      const matchedBuyer = res.data.find(
        (b: any) => b.Email?.toLowerCase() === loginEmail.toLowerCase(),
      );

      if (!matchedBuyer) {
        setError("Buyer profile not found.");
        return;
      }

      const mappedBuyer: BuyerProfileType = {
        id: String(matchedBuyer.id || matchedBuyer._id),
        name: matchedBuyer.Name,
        email: matchedBuyer.Email,
        mobile: matchedBuyer.Mobile,
        companyName: matchedBuyer["Company Name"],
        companyAddress: {
          city: matchedBuyer["Company Address"]?.City,
          state: matchedBuyer["Company Address"]?.State,
          country: matchedBuyer["Company Address"]?.Country,
        },
        preferredCrops: matchedBuyer.PreferredCrops,
        verified: matchedBuyer.verified,
      };

      await AsyncStorage.setItem("buyerProfile", JSON.stringify(mappedBuyer));

      setBuyer(mappedBuyer);
    } catch (err) {
      console.log("Profile load error:", err);
      setError("Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      "token",
      "loginEmail",
      "buyerProfile",
      "role",
    ]);
    router.replace("/auth/buyerlogin");
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E7D32" />
      </SafeAreaView>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar style="dark" />
        <Text style={{ color: "#DC2626", marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={{ color: "#2563EB", fontWeight: "700" }}>
            Go to Login
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <MaterialCommunityIcons
            name="account-circle"
            size={72}
            color="#2E7D32"
          />
          <Text style={styles.name}>{buyer?.companyName || "-"}</Text>
          <Text style={styles.subText}>
            Buyer · {buyer?.companyAddress?.city || "-"}
          </Text>
        </View>

        {/* BUSINESS DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏢 Business Details</Text>

          <Info label="Owner Name" value={buyer?.name} />
          <Info label="Business Name" value={buyer?.companyName} />
          <Info
            label="Location"
            value={`${buyer?.companyAddress?.city || "-"}, ${
              buyer?.companyAddress?.state || "-"
            }`}
          />
          <Info label="Mobile" value={buyer?.mobile} />
          <Info label="Email" value={buyer?.email} />
          <Info
            label="Verification"
            value={buyer?.verified ? "Verified ✅" : "Not Verified ❌"}
          />
        </View>

        {/* ACTIVITY */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📊 My Activity</Text>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => router.push("/buyer-demands")}
          >
            <Text style={styles.rowText}>Posted Demands</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* SETTINGS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>

          <TouchableOpacity
            style={[styles.rowItem, styles.logoutRow]}
            onPress={logout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- INFO ROW ---------- */
function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  header: {
    alignItems: "center",
    paddingBottom: 24,
    backgroundColor: "#fff",
    marginBottom: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
    color: "#111827",
  },

  subText: {
    color: "#6B7280",
    marginTop: 2,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  infoRow: {
    marginBottom: 8,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },

  rowText: {
    fontSize: 15,
    color: "#111827",
  },

  logoutRow: {
    marginTop: 8,
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 15,
  },
});
