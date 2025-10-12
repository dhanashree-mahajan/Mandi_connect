import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";

type TabBarIconProps = NonNullable<BottomTabNavigationOptions["tabBarIcon"]> extends (
  props: infer P
) => any
  ? P
  : never;

export default function FarmerLayout() {
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
          height: 60,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          textTransform: "none",
        },
      }}
    >
      {/* 🏠 Home */}
      <Tabs.Screen
        name="farmer-dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* 🛒 Marketplace */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <MaterialCommunityIcons
              name={focused ? "store" : "store-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* 👤 Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* 🚫 Hidden routes */}
      <Tabs.Screen name="add-price" options={{ href: null }} />
      <Tabs.Screen name="add-market" options={{ href: null }} />
      <Tabs.Screen name="add-crop" options={{ href: null }} />
      <Tabs.Screen name="notification" options={{ href: null }} />
    </Tabs>
  );
}
