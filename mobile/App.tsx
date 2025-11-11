import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "./app/context/AuthProvider";
import { AuthNavigation } from "./app/navigation/AuthNavigator";
import { ThemeProviderCustom } from "@tpfinal/context/ThemeContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  console.log("✅ App.tsx: render principal");
useEffect(() => {
  const hideSplash = async () => {
    console.log("🧼 Intentando ocultar SplashScreen...");
    await SplashScreen.hideAsync();
    console.log("✅ SplashScreen ocultado");
  };
  hideSplash();
}, []);

  return (
    <ThemeProviderCustom>
      <AuthProvider>
        <AppContainer />
      </AuthProvider>
    </ThemeProviderCustom>
  );
}

function AppContainer() {
  
      console.log("🧩 AppContainer: se montó");
  return <AuthNavigation />;
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
