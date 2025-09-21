import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Screens
import BuyerSignIn from "./app/auth/Buyer-log-in";
import FarmerLogin from "./app/auth/Farmer-log-in";
import Index from "./app/index";

// Define stack param list
export type RootStackParamList = {
  Index: undefined;
  BuyerSignIn: undefined;
  FarmerLogin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Index" component={Index} />
        <Stack.Screen name="BuyerSignIn" component={BuyerSignIn} />
        <Stack.Screen name="FarmerLogin" component={FarmerLogin} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

