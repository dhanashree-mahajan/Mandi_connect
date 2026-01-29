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
type FarmerProfileType = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  verified?: boolean;
  farmerAddress?: {
    city?: string;
    state?: string;
  };
};

export default function FarmerProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [farmer, setFarmer] = useState<FarmerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profile" | "activity">("profile");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/farmer/getFarmers`);
      const email = JSON.parse(atob(token.split(".")[1]))?.sub?.toLowerCase();

      const match = res.data.find((f: any) => f.email?.toLowerCase() === email);

      setFarmer({
        id: match.id || match._id,
        name: match.name,
        email: match.email,
        mobile: match.mobile,
        verified: match.verified,
        farmerAddress: {
          city: match.farmerAddress?.city,
          state: match.farmerAddress?.state,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "role"]);
    router.replace("/auth/farmerlogin");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="tractor" size={42} color="#2E7D32" />
          </View>

          <Text style={styles.name}>{farmer?.name}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {farmer?.verified ? "Verified Farmer" : "Farmer"}
            </Text>
          </View>

          <Text style={styles.location}>
            {farmer?.farmerAddress?.city || "-"},{" "}
            {farmer?.farmerAddress?.state || "-"}
          </Text>
        </View>

        {/* TABS */}
        <View style={styles.tabRow}>
          <Tab
            label="Profile"
            active={tab === "profile"}
            onPress={() => setTab("profile")}
          />
          <Tab
            label="Activity"
            active={tab === "activity"}
            onPress={() => setTab("activity")}
          />
        </View>

        {/* PROFILE */}
        {tab === "profile" && (
          <>
            <Card title="Personal Information">
              <Info label="Full Name" value={farmer?.name} />
              <Info label="Mobile Number" value={farmer?.mobile} />
              <Info label="Email Address" value={farmer?.email} />
              <Info
                label="Location"
                value={`${farmer?.farmerAddress?.city || "-"}, ${
                  farmer?.farmerAddress?.state || "-"
                }`}
              />
            </Card>

            <Card title="Account">
              <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <MaterialCommunityIcons
                  name="logout"
                  size={18}
                  color="#DC2626"
                />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* ACTIVITY */}
        {tab === "activity" && (
          <>
            <Card title="Market Activity">
              <Info label="Average Price" value="—" />
              <Info label="Minimum Price" value="—" />
              <Info label="Maximum Price" value="—" />
            </Card>

            <Card>
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push("/farmer/my-entries")}
              >
                <Text style={styles.rowText}>View My Crop Entries</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Tab({
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
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 24,
    marginBottom: 12,
  },

  avatar: {
    height: 72,
    width: 72,
    borderRadius: 36,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  name: { fontSize: 20, fontWeight: "800", color: "#111827" },

  badge: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
  },

  badgeText: { color: "#166534", fontSize: 12, fontWeight: "700" },

  location: { marginTop: 6, color: "#6B7280", fontSize: 13 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 12,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabActive: {
    borderBottomWidth: 3,
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

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },

  infoRow: { marginBottom: 10 },
  infoLabel: { fontSize: 12, color: "#6B7280" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#111827" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowText: { fontSize: 15, color: "#111827" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 15,
  },
});
