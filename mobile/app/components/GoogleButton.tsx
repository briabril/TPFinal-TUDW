import { View, Text, TouchableOpacity, Image, Linking } from "react-native";
import { useThemeContext } from "../../../packages/context";

export const GoogleButton = () => {
  const { theme } = useThemeContext();

  const goToGoogle = () => {
    Linking.openURL("http://192.168.0.228:4000/auth/google");
  };

  return (
    <TouchableOpacity
      onPress={goToGoogle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: theme.spacing(2),
      }}
    >
  
      <Text
        style={{
          color: theme.colors.textPrimary,
          fontWeight: "500",
          fontSize: 16,
        }}
      >
        Continuar con Google
      </Text>
    </TouchableOpacity>
  );
};
