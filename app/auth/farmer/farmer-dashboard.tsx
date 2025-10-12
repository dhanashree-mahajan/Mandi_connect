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

const dummyPrices = [
  {
    id: "1",
    crop: "Wheat",
    market: "Lahore Market",
    price: "₹1,500 /quintal",
    change: "Up 2.5%",
    status: "up",
    time: "2 hours ago",
  },
  {
    id: "2",
    crop: "Rice (Basmati)",
    market: "Karachi Wholesale",
    price: "₹2,200 /quintal",
    change: "Down 1%",
    status: "down",
    time: "5 hours ago",
  },
  {
    id: "3",
    crop: "Corn",
    market: "Faisalabad Mandi",
    price: "₹1,250 /quintal",
    change: "Stable",
    status: "stable",
    time: "1 hour ago",
  },
];

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState<"market" | "community">("market");

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={styles.crop}>{item.crop}</Text>
          <Text style={styles.market}>{item.market}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.price}>{item.price}</Text>
          <View
            style={[
              styles.badge,
              item.status === "up"
                ? { backgroundColor: "#D1FAE5" }
                : item.status === "down"
                ? { backgroundColor: "#FEE2E2" }
                : { backgroundColor: "#FEF9C3" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                item.status === "up"
                  ? { color: "#15803D" }
                  : item.status === "down"
                  ? { color: "#B91C1C" }
                  : { color: "#92400E" },
              ]}
            >
              {item.change}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farmer Dashboard</Text>
        <MaterialCommunityIcons name="bell-outline" size={22} color="#374151" />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("market")}
          style={[
            styles.tabButton,
            activeTab === "market" && styles.activeTabButton,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "market" && styles.activeTabText,
            ]}
          >
            All Market Prices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("community")}
          style={[
            styles.tabButton,
            activeTab === "community" && styles.activeTabButton,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "community" && styles.activeTabText,
            ]}
          >
            Community Prices
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort info */}
      <View style={styles.sortRow}>
        <MaterialCommunityIcons name="filter-variant" size={18} color="#4B5563" />
        <Text style={styles.sortText}> Sort by: Market, Crop</Text>
      </View>

      {/* Price List */}
      <FlatList
        data={dummyPrices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(farmer)/ad-dmarket")}
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
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  sortText: { color: "#4B5563", fontSize: 13, marginLeft: 6 },
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
  badge: {
    marginTop: 4,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "500" },
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
