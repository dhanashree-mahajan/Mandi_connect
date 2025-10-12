import { StyleSheet, Text, View } from "react-native";

export default function Marketplace() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🛒 Marketplace (Coming Soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 18, fontWeight: "600", color: "#2E7D32" },
});
