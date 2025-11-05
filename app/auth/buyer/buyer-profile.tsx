import { SafeAreaView, Text } from "react-native";

export default function BuyerProfile() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2E7D32" }}>
        👤 Buyer Profile
      </Text>
      <Text>Manage your account and settings here</Text>
    </SafeAreaView>
  );
}
