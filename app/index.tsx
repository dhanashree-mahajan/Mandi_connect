import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();

  const goAsBuyer = async () => {
    const token = await AsyncStorage.getItem("token");
    const role = await AsyncStorage.getItem("role");

    if (token && role === "buyer") {
      router.push("/auth/buyer/buyerdashboard");
    } else {
      router.push("/auth/buyerlogin");
    }
  };

  const goAsFarmer = async () => {
    const token = await AsyncStorage.getItem("token");
    const role = await AsyncStorage.getItem("role");

    if (token && role === "farmer") {
      router.push("/auth/farmer/farmer-dashboard");
    } else {
      router.push("/auth/farmerlogin");
    }
  };

  return (
    <>
      <StatusBar style="light" translucent />

      <ImageBackground
        source={require("../assets/images/background.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Overlay */}
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safe}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>🌾 Mandi Connect</Text>
            <Text style={styles.subtitle}>
              Connecting Farmers and Buyers Seamlessly
            </Text>

            {/* Buyer Card */}
            <View style={styles.card}>
              <MaterialCommunityIcons
                name="account-outline"
                size={42}
                color="#2E7D32"
              />
              <Text style={styles.cardTitle}>Buyer</Text>

              <TouchableOpacity style={styles.buyerBtn} onPress={goAsBuyer}>
                <Text style={styles.btnText}>Go as Buyer</Text>
              </TouchableOpacity>
            </View>

            {/* Farmer Card */}
            <View style={styles.card}>
              <MaterialCommunityIcons
                name="sprout-outline"
                size={42}
                color="#388E3C"
              />
              <Text style={styles.cardTitle}>Farmer</Text>

              <TouchableOpacity style={styles.farmerBtn} onPress={goAsFarmer}>
                <Text style={styles.btnText}>Go as Farmer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },

  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 30,
    textAlign: "center",
  },

  card: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 10,
  },

  buyerBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  farmerBtn: {
    backgroundColor: "#388E3C",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
