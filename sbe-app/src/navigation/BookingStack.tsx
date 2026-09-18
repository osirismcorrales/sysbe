import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookScreen from "../features/booking/screens/BookScreen";
import ConfirmBookingScreen from "../features/booking/screens/ConfirmBookingScreen";
import MyReservationsScreen from "../features/booking/screens/MyReservationsScreen";

export type BookingStackParamList = {
  BookService: undefined;
  ConfirmBooking: {
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    price: number;
  };
  MyReservations: undefined;
};

const Stack = createNativeStackNavigator<BookingStackParamList>();

export default function BookingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookService" component={BookScreen} />
      <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} />
      <Stack.Screen name="MyReservations" component={MyReservationsScreen} />
    </Stack.Navigator>
  );
}
