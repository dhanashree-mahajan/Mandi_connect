import { SafeAreaView, Text } from "react-native";

export default function Notifications() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2E7D32" }}>
        🔔 Notifications
      </Text>
      <Text>No new notifications yet</Text>
    </SafeAreaView>
  );
}
