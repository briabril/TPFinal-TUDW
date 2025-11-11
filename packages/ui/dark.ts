import { baseTheme } from "./base";

export const darkTheme = {
  ...baseTheme,
  mode: "dark" as const,
  colors: {
    ...baseTheme.colors,
    primary: "#90caf9",
    primaryDark: "#42a5f5",
    secondary: "#ce93d8",
    secondaryDark: "#ab47bc",
    background: "#121212",
    surface: "#1e1e1e",
    textPrimary: "#ffffff",
    textSecondary: "#bbbbbb",
    border: "#333333",
    success: "#66bb6a",
    error: "#ef5350",
    warning: "#ffb300",
  },
  typography:{
    ...baseTheme.typography,
  },
   components: {
    ...baseTheme.components,
    input: {
      ...baseTheme.components.inputBase,
      backgroundColor: "#1e1e1e",
      borderColor: "#333",
    },
    button: {
      ...baseTheme.components.buttonBase,
      backgroundColor: "#90caf9",
    },
  },
};
