import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.profileBox}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/219/219983.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Farmer Name</Text>
        <Text style={styles.email}>farmer@example.com</Text>
      </View>

      <View style={styles.options}>
        <View style={styles.optionItem}>
          <MaterialCommunityIcons name="tractor" size={22} color="#2E7D32" />
          <Text style={styles.optionText}>My Crops</Text>
        </View>
        <View style={styles.optionItem}>
          <MaterialCommunityIcons name="wallet-outline" size={22} color="#2E7D32" />
          <Text style={styles.optionText}>Earnings</Text>
        </View>
        <View style={styles.optionItem}>
          <MaterialCommunityIcons name="cog-outline" size={22} color="#2E7D32" />
          <Text style={styles.optionText}>Settings</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", alignItems: "center" },
  header: { paddingTop: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#2E7D32", textAlign: "center" },
  profileBox: { alignItems: "center", marginTop: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "700", color: "#111827" },
  email: { color: "#6b7280", marginBottom: 20 },
  options: { width: "90%", marginTop: 20 },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  optionText: { marginLeft: 10, fontSize: 16, color: "#374151" },
});
