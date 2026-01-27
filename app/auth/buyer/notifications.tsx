import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ---------- TYPES ---------- */
type NotificationItem = {
  id: string;
  type: "FARMER_LISTING" | "INTEREST_ACCEPTED" | "PRICE_UPDATE";
  message: string;
  subText?: string;
  time: string;
  isRead: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: "1",
    type: "FARMER_LISTING",
    message: "New Brinjal listing available near you",
    subText: "Sangamner mandi",
    time: "5 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "INTEREST_ACCEPTED",
    message: "Farmer accepted your interest",
    subText: "You can now contact the farmer",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    type: "PRICE_UPDATE",
    message: "Tomato price decreased today",
    time: "Yesterday",
    isRead: true,
  },
];

export default function BuyerNotifications() {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const icon =
      item.type === "FARMER_LISTING"
        ? "leaf"
        : item.type === "INTEREST_ACCEPTED"
          ? "check-circle-outline"
          : "chart-line";

    return (
      <TouchableOpacity
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

          {item.subText ? (
            <Text style={styles.subText}>{item.subText}</Text>
          ) : null}

          <Text style={styles.time}>{item.time}</Text>
        </View>

        {!item.isRead && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
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

  subText: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
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
