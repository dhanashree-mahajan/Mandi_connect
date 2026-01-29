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
  verified?: boolean;
};

export default function BuyerProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [buyer, setBuyer] = useState<BuyerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "activity">("profile");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const loginEmail = await AsyncStorage.getItem("loginEmail");

      if (!token || !loginEmail) {
        setError("Session expired. Please login again.");
        return;
      }

      const res = await axios.get(`${BASE_URL}/buyer/getAll`);

      const matchedBuyer = res.data.find(
        (b: any) => b.Email?.toLowerCase() === loginEmail.toLowerCase(),
      );

      if (!matchedBuyer) {
        setError("Buyer profile not found.");
        return;
      }

      setBuyer({
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
        verified: matchedBuyer.verified,
      });
    } catch (e) {
      setError("Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "loginEmail", "role"]);
    router.replace("/auth/buyerlogin");
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </SafeAreaView>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.link}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <MaterialCommunityIcons
          name="account-circle"
          size={72}
          color="#2E7D32"
        />
        <Text style={styles.name}>{buyer?.companyName}</Text>
        <Text style={styles.subText}>
          Buyer · {buyer?.companyAddress?.city || "-"}
        </Text>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TabButton
          label="Profile"
          active={activeTab === "profile"}
          onPress={() => setActiveTab("profile")}
        />
        <TabButton
          label="Activity"
          active={activeTab === "activity"}
          onPress={() => setActiveTab("activity")}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
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
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
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
        )}

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

/* ---------- SMALL COMPONENTS ---------- */
function Info({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 20,
  },

  name: { fontSize: 20, fontWeight: "800", marginTop: 8 },
  subText: { color: "#6B7280" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#2E7D32",
  },

  tabText: { color: "#6B7280", fontWeight: "600" },
  tabTextActive: { color: "#2E7D32" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
  },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

  infoRow: { marginBottom: 8 },
  label: { fontSize: 12, color: "#6B7280" },
  value: { fontSize: 14, fontWeight: "600" },

  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  rowText: { fontSize: 15 },
  logoutRow: { marginTop: 8 },
  logoutText: { color: "#DC2626", fontWeight: "700" },

  error: { color: "#DC2626", marginBottom: 12 },
  link: { color: "#2563EB", fontWeight: "700" },
});
