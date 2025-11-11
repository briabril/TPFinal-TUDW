import { ThemeProviderCustom, useThemeContext } from "../../../packages/context";
import { View, StyleSheet, Text } from "react-native";
import { SunMedium , Moon  } from 'lucide-react';
import Button from "../components/Button"
const ToggleButton = () =>{

  const { theme, toggleDarkMode, darkMode } = useThemeContext();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={{ color: theme.colors.textPrimary }}>Modo: {darkMode ? "Oscuro" : "Claro"}</Text>
      <Button children={darkMode? <SunMedium/> : <Moon/>} onPress={toggleDarkMode} />
    </View>
  );
}
const styles = StyleSheet.create({
    container:{
            flex: 1,
    alignItems: "center",
    justifyContent: "center",
    }
})

export default ToggleButton