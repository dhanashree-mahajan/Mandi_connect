import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Welcome() {
  const router = useRouter();
  const [language, setLanguage] = useState(""); // Initially empty
  const [showOptions, setShowOptions] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowOptions(!showOptions);
  };

  const selectLanguage = (lang: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLanguage(lang);
    setShowOptions(false);
  };

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* Language Selector */}
      <View style={styles.languageWrapper}>
        <TouchableOpacity style={styles.languageButton} onPress={toggleDropdown}>
          <Text style={styles.languageText}>
            {language === "" ? "Select Language" : language}
          </Text>
          <Ionicons
            name={showOptions ? "chevron-up" : "chevron-down"}
            size={18}
            color="#2d6a4f"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>

        {showOptions && (
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={() => selectLanguage("English")}>
              <Text style={styles.option}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => selectLanguage("हिंदी")}>
              <Text style={styles.option}>हिंदी</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => selectLanguage("मराठी")}>
              <Text style={styles.option}>मराठी</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>🌾</Text>
        </View>

        <Text style={styles.title}>Welcome to Mandi Connection</Text>
        <Text style={styles.subtitle}>
          Link with farmers and traders easily 🌱
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/auth/sign-in")}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push("/auth/sign-up")}
          >
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  languageWrapper: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2d6a4f",
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: "#2d6a4f",
  },

  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: { fontSize: 50 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: { width: "100%", alignItems: "center" },
  loginButton: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    width: "70%",
    alignItems: "center",
  },
  loginText: { color: "white", fontSize: 16, fontWeight: "600" },
  signupButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#2d6a4f",
    width: "70%",
    alignItems: "center",
  },
  signupText: { color: "#2d6a4f", fontSize: 16, fontWeight: "600" },
});
