import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationType = "BUYER_DEMAND" | "FEEDBACK" | "PRICE_UPDATE";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: "1",
    type: "BUYER_DEMAND",
    title: "Buyer interested",
    message: "Buyer wants 200kg Brinjal near your mandi",
    time: "10 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "FEEDBACK",
    title: "Price feedback",
    message: "5 farmers agreed with your Brinjal price",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    type: "PRICE_UPDATE",
    title: "Price update",
    message: "No new price update for Onion today",
    time: "Yesterday",
    isRead: true,
  },
];

export default function FarmerNotifications() {
  const renderItem = ({ item }: { item: NotificationItem }) => {
    const icon =
      item.type === "BUYER_DEMAND"
        ? "account-search"
        : item.type === "FEEDBACK"
          ? "thumb-up-outline"
          : "chart-line";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.card, !item.isRead && styles.unreadCard]}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={item.isRead ? "#6B7280" : "#2E7D32"}
          />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.message, !item.isRead && styles.unreadText]}>
            {item.message}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        {!item.isRead && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#fff",
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },

  iconWrap: {
    marginRight: 12,
  },

  textWrap: {
    flex: 1,
  },

  message: {
    fontSize: 14,
    color: "#374151",
  },

  unreadText: {
    fontWeight: "700",
    color: "#111827",
  },

  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2E7D32",
  },
});
