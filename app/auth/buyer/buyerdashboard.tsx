import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const dummyDemands = [
  {
    id: "1",
    crop: "Wheat",
    quantity: "500 kg",
    price: "₹1,400 /quintal",
    status: "active",
    market: "Lahore Mandi",
    time: "2 hours ago",
  },
  {
    id: "2",
    crop: "Rice (Basmati)",
    quantity: "300 kg",
    price: "₹2,000 /quintal",
    status: "fulfilled",
    market: "Karachi Wholesale",
    time: "1 day ago",
  },
  {
    id: "3",
    crop: "Corn",
    quantity: "1000 kg",
    price: "₹1,100 /quintal",
    status: "cancelled",
    market: "Faisalabad Mandi",
    time: "3 days ago",
  },
];

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState<"active" | "fulfilled" | "cancelled">("active");

  const filteredDemands = dummyDemands.filter((item) =>
    activeTab === "active" ? item.status === "active" : item.status === activeTab
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={styles.crop}>{item.crop}</Text>
          <Text style={styles.market}>{item.market}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.quantity}>{item.quantity}</Text>
        </View>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buyer Dashboard</Text>
        <MaterialCommunityIcons name="bell-outline" size={22} color="#374151" />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {["active", "fulfilled", "cancelled"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredDemands}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(buyer)/add-demand")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  activeTabButton: { backgroundColor: "#2E7D32" },
  tabText: { color: "#2E7D32", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  crop: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  market: { color: "#6B7280", fontSize: 13, marginTop: 2 },
  price: { fontSize: 16, fontWeight: "600", color: "#2E7D32" },
  quantity: { color: "#4B5563", fontSize: 13 },
  time: { marginTop: 6, color: "#9CA3AF", fontSize: 12 },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#2E7D32",
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
});
