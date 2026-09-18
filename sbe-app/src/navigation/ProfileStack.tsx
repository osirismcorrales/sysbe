import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import EditProfileScreen from "../features/profile/screens/EditProfileScreen";
import CarnetQRScreen from "../features/profile/screens/CarnetQRScreen";

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  CarnetQR: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="CarnetQR" component={CarnetQRScreen} />
    </Stack.Navigator>
  );
}
