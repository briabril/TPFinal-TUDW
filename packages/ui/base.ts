import { TextStyle } from "react-native";
export const baseTheme = {
  spacing: (value: number) => value * 8,

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
  },
  colors: {
  background: "#ffffff",
  text: "#000000",
  primary: "#003fff",
  secondary: "#565656",
},
  typography: {
    fontFamily: "System",
    h1: { fontSize: 32, fontWeight: "700", lineHeight: 38 } as TextStyle,
    h2: { fontSize: 26, fontWeight: "600", lineHeight: 32 } as TextStyle,
    h3: { fontSize: 22, fontWeight: "600", lineHeight: 28 } as TextStyle,
    body: { fontSize: 16, fontWeight: "400", lineHeight: 22 } as TextStyle,
    caption: { fontSize: 12, fontWeight: "400" } as TextStyle,
    base: { fontSize: 16, fontWeight: "600" } as TextStyle,
    error: { fontSize: 10, fontWeight: "400" } as TextStyle,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  components: {
    inputBase: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
    },
    buttonBase: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
  }
};
