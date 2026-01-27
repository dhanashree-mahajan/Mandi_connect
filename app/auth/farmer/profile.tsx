import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Crop = string;

export default function FarmerProfile() {
  const router = useRouter();

  // 🔹 TEMP static data (can be API later)
  const farmerName = "Ramesh Patil";
  const location = "Sangamner";
  const crops: Crop[] = ["Brinjal", "Onion", "Tomato"];
  const verified = true;

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "userId", "role"]);
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="account-circle"
            size={64}
            color="#2E7D32"
          />
          <Text style={styles.name}>{farmerName}</Text>
          <Text style={styles.subText}>Farmer · {location}</Text>
        </View>

        {/* CROPS GROWN */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🌱 Crops Grown</Text>
          <View style={styles.chipsRow}>
            {crops.map((crop) => (
              <Text key={crop} style={styles.chip}>
                {crop}
              </Text>
            ))}
          </View>
        </View>

        {/* MY ACTIVITY */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📊 My Activity</Text>

          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => router.push("/farmer/price-history")}
          >
            <Text style={styles.rowText}>Price History</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => router.push("/farmer/my-listings")}
          >
            <Text style={styles.rowText}>My Listings</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* VERIFICATION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>✅ Verification</Text>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name={verified ? "check-decagram" : "alert-circle-outline"}
              size={20}
              color={verified ? "#2E7D32" : "#DC2626"}
            />
            <Text
              style={[styles.verifiedText, !verified && { color: "#DC2626" }]}
            >
              {verified ? "Verified Farmer" : "Not Verified"}
            </Text>
          </View>
        </View>

        {/* SETTINGS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>

          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => router.push("/farmer/edit-profile")}
          >
            <Text style={styles.rowText}>Edit Profile</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => router.push("/farmer/notification-settings")}
          >
            <Text style={styles.rowText}>Notification Preferences</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rowItem, styles.logoutRow]}
            activeOpacity={0.7}
            onPress={logout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    alignItems: "center",
    paddingVertical: 24,
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

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  chip: {
    backgroundColor: "#E5F4EA",
    color: "#2E7D32",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    fontWeight: "600",
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

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  verifiedText: {
    marginLeft: 8,
    color: "#2E7D32",
    fontWeight: "700",
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
