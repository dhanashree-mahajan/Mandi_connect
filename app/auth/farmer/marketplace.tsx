import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Marketplace() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>Buy and Sell farm produce</Text>
      </View>

      <View style={styles.content}>
        <MaterialCommunityIcons name="cart-outline" size={80} color="#2E7D32" />
        <Text style={styles.infoText}>Marketplace coming soon!</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
    marginBottom: 40,
  },
  backText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
});
