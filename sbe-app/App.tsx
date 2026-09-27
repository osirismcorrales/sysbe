import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/api";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
}

