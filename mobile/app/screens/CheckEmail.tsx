import { View, Text } from "react-native";
import { useThemeContext } from "@../../../packages/context";
export default function CheckEmail() {
    const {theme} = useThemeContext();
  return (
    <View style={{}}>
      <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>Registro exitoso</Text>
      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Te enviamos un correo. Hacé click en el enlace del email para activar tu cuenta.</Text>
    </View>
  );
}
