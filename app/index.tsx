import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions(); // 👈 get screen width

  const isLargeScreen = width > 768; // 👈 Tablet/Laptop breakpoint

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ImageBackground
        source={require("../assets/images/background.jpg")}
        style={{ flex: 1, width: "100%", height: "100%" }}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
          {/* Header */}
          <View style={{ alignItems: "center", marginTop: 40, marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#2E7D32" }}>🌾 Mandi Connect</Text>
            <Text
              style={{
                fontSize: 14,
                color: "#000",
                marginTop: 5,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              Connecting Farms to Futures
            </Text>
          </View>

          {/* Buyer & Farmer Section */}
          <View
            style={{
              flexDirection: isLargeScreen ? "row" : "column", // 👈 responsive direction
              justifyContent: isLargeScreen ? "space-evenly" : "center",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            {/* Buyer Card */}
            <View
              style={{
                width: isLargeScreen ? "40%" : "90%", // 👈 responsive width
                backgroundColor: "rgba(255,255,255,0.95)",
                margin: 10,
                padding: 20,
                borderRadius: 15,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <MaterialCommunityIcons name="account-outline" size={40} color="#2E7D32" />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#2E7D32", marginVertical: 10 }}>
                Buyers
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#2E7D32",
                  paddingVertical: 10,
                  borderRadius: 10,
                  width: "100%",
                  alignItems: "center",
                }}
                onPress={() => router.push("/auth/buyerlogin")}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Go as Buyer →</Text>
              </TouchableOpacity>
            </View>

            {/* Farmer Card */}
            <View
              style={{
                width: isLargeScreen ? "40%" : "90%",
                backgroundColor: "rgba(255,255,255,0.95)",
                margin: 10,
                padding: 20,
                borderRadius: 15,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <MaterialCommunityIcons name="sprout-outline" size={40} color="#388E3C" />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#388E3C", marginVertical: 10 }}>
                Farmers
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#388E3C",
                  paddingVertical: 10,
                  borderRadius: 10,
                  width: "100%",
                  alignItems: "center",
                }}
                onPress={() => router.push("/auth/farmerlogin")}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Go as Farmer →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
