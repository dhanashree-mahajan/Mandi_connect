import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#2d6a4f", "#40916c", "#95d5b2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Logo Animation */}
      <Animatable.Text
        animation="zoomIn"
        duration={1500}
        style={styles.logo}
      >
        🌾 Mandi Connection
      </Animatable.Text>

      {/* Tagline Animation */}
      <Animatable.Text
        animation="fadeInUp"
        delay={1200}
        duration={1500}
        style={styles.tagline}
      >
        Fair Prices • Direct Market • For Farmers
      </Animatable.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "#f1faee",
    marginTop: 15,
    textAlign: "center",
  },
});
