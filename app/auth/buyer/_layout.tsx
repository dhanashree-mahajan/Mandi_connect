import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";

export default function BuyerLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/(auth)/login");
      }
    };
    checkAuth();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: { backgroundColor: "#fff", height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
      }}
    >
      {/* 🏠 Buyer Dashboard (Home) */}
      <Tabs.Screen
        name="buyer-dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({
            color,
            focused,
            size,
          }: {
            color: string;
            focused: boolean;
            size: number;
          }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ➕ Add Demand */}
      <Tabs.Screen
        name="add-demand"
        options={{
          title: "Add Demand",
          tabBarIcon: ({
            color,
            focused,
            size,
          }: {
            color: string;
            focused: boolean;
            size: number;
          }) => (
            <MaterialCommunityIcons
              name={focused ? "plus-box" : "plus-box-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 📋 My Demands */}
      <Tabs.Screen
        name="my-demands"
        options={{
          title: "My Demands",
          tabBarIcon: ({
            color,
            focused,
            size,
          }: {
            color: string;
            focused: boolean;
            size: number;
          }) => (
            <MaterialCommunityIcons
              name={focused ? "clipboard-list" : "clipboard-list-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 👤 Profile */}
      <Tabs.Screen
        name="buyer-profile"
        options={{
          title: "Profile",
          tabBarIcon: ({
            color,
            focused,
            size,
          }: {
            color: string;
            focused: boolean;
            size: number;
          }) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
