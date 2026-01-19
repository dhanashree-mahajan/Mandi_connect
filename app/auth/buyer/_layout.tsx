import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function BuyerLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/(auth)/login");
      }
    };
    checkAuth();
  }, []);

  const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 56 + insets.bottom : 60;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#2E7D32",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            backgroundColor: "#fff",
            height: TAB_BAR_HEIGHT,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="buyerdashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Marketplace",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "store" : "store-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "bell" : "bell-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "account" : "account-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen name="addDemand" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}
