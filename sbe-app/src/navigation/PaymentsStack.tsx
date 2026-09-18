import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PaymentsScreen from "../features/payments/screens/PaymentsScreen";

export type PaymentsStackParamList = {
  PaymentsList: undefined;
};

const Stack = createNativeStackNavigator<PaymentsStackParamList>();

export default function PaymentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PaymentsList" component={PaymentsScreen} />
    </Stack.Navigator>
  );
}
