import React, { useEffect } from "react";
import { Text } from "react-native";
import { useAuth } from "@tpfinal/context/AuthBase";
import { NavigationContainer } from "@react-navigation/native";
import { AppStack } from "./AppStack";
import { AuthStack } from "./AuthStack";

export const AuthNavigation = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("🧭 AuthNavigation:", { loading, user });
  }, [loading, user]);

  if (loading) {
    return <Text>Cargando usuario...</Text>;
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
