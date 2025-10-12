import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function Notifications() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Stay updated with the latest alerts</Text>
      </View>

      <View style={styles.content}>
        <MaterialCommunityIcons name="bell-outline" size={80} color="#2E7D32" />
        <Text style={styles.infoText}>No notifications yet</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", alignItems: "center" },
  header: { paddingTop: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#2E7D32", textAlign: "center" },
  subtitle: { color: "#4b5563", textAlign: "center", marginTop: 4 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoText: { marginTop: 12, color: "#6b7280", fontSize: 16 },
});
