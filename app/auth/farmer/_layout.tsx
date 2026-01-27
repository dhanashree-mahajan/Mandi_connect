import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Tabs, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

type TabBarIconProps =
  NonNullable<BottomTabNavigationOptions["tabBarIcon"]> extends (
    props: infer P,
  ) => any
    ? P
    : never;

export default function FarmerLayout() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkFarmerAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      if (!token || role !== "farmer") {
        router.replace("/auth/farmerlogin");
        return;
      }

      setCheckingAuth(false);
    };

    checkFarmerAuth();
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 70,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          textTransform: "none",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      {/* 🏠 Home */}
      <Tabs.Screen
        name="farmer-dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* 🛒 Marketplace */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <MaterialCommunityIcons
              name={focused ? "store" : "store-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* 🔔 Notifications */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <MaterialCommunityIcons
              name={focused ? "bell" : "bell-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* 👤 Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* 🚫 Hidden routes */}
      <Tabs.Screen name="add-crop" options={{ href: null }} />
      <Tabs.Screen name="add-market" options={{ href: null }} />
    </Tabs>
  );
}
