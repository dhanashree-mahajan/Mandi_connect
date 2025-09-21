import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/farmer.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>🌾Mandi Connect</Text>
          <Text style={styles.subtitle}>Connecting Farms to Futures</Text>
        </View>

        {/* Buyer & Farmer Section */}
        <View style={styles.cardContainer}>
          {/* Buyer Card */}
          <View style={styles.card}>
            <MaterialCommunityIcons
              name="account-outline"
              size={40}
              color="#2E7D32"
            />
            <Text style={styles.cardTitle}>Buyers</Text>
            <Text style={styles.cardText}>
              Access fresh, quality produce directly from local farmers.
            </Text>
            <View style={styles.points}>
              <Text>✔ Premium quality assurance</Text>
              <Text>✔ Transparent pricing</Text>
              <Text>✔ Direct farmer connections</Text>
            </View>
            <TouchableOpacity
              style={styles.buyerBtn}
              onPress={() => router.push("/auth/Buyer-log-in")}
            >
              <Text style={styles.btnText}>Go as Buyer→</Text>
            </TouchableOpacity>
          </View>

          {/* Farmer Card */}
          <View style={styles.card}>
            <MaterialCommunityIcons
              name="sprout-outline"
              size={40}
              color="#388E3C"
            />
            <Text style={styles.cardTitle}>Farmers</Text>
            <Text style={styles.cardText}>
              Showcase your harvest to a wider market.
            </Text>
            <View style={styles.points}>
              <Text>✔ Better profit margins</Text>
              <Text>✔ Wider market reach</Text>
              <Text>✔ Secure payments</Text>
              <Text>✔ Updated Info</Text>
            </View>
            <TouchableOpacity
              style={styles.farmerBtn}
              onPress={() => router.push("/auth/Farmer-log-in")}
            >
              <Text style={styles.btnText}>Go as Farmer→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <View style={styles.featureBox}>
            <MaterialCommunityIcons
              name="shield-check"
              size={36}
              color="#2E7D32"
            />
            <Text style={styles.featureTitle}>Trust</Text>
            <Text style={styles.featureText}>
              Verified farmers and quality.
            </Text>
          </View>

          <View style={styles.featureBox}>
            <MaterialCommunityIcons name="leaf" size={36} color="#388E3C" />
            <Text style={styles.featureTitle}>Sustainability</Text>
            <Text style={styles.featureText}>
              Supporting eco-friendly farming.
            </Text>
          </View>

          <View style={styles.featureBox}>
            <MaterialCommunityIcons
              name="account-group"
              size={36}
              color="#43A047"
            />
            <Text style={styles.featureTitle}>Community</Text>
            <Text style={styles.featureText}>
              Building lasting relationships.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    marginTop: 60,
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  subtitle: {
    fontSize: 16,
    color: "#222",
    marginTop: 5,
    fontWeight: "600",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 40,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#1B5E20",
  },
  cardText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    color: "#444",
  },
  points: {
    marginBottom: 15,
  },
  buyerBtn: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  farmerBtn: {
    backgroundColor: "#43A047",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  featureBox: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featureTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 5,
    color: "#1B5E20",
  },
  featureText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    color: "#333",
  },
});


