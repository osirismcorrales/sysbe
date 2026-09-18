import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme";

// Screens & Stacks
import HomeScreen from "../features/home/screens/HomeScreen";
import BookingStack from "./BookingStack";
import PaymentsStack from "./PaymentsStack";
import ProfileStack from "./ProfileStack";

export type AppTabsParamList = {
  Inicio: undefined;
  Reservas: undefined;
  Pagos: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 54 + (insets.bottom > 0 ? insets.bottom + 8 : 16),
          paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "Inicio") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Reservas") iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "Pagos") iconName = focused ? "card" : "card-outline";
          else if (route.name === "Perfil") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Reservas" component={BookingStack} />
      <Tab.Screen name="Pagos" component={PaymentsStack} />
      <Tab.Screen name="Perfil" component={ProfileStack} />
    </Tab.Navigator>
  );
}
