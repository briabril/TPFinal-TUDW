import { baseTheme } from "./base";

export const lightTheme = {
  ...baseTheme,
  mode: "light" as const,
  colors: {
    ...baseTheme.colors,
    primary: "#1976d2",
    primaryDark: "#115293",
    secondary: "#9c27b0",
    secondaryDark: "#6d1b7b",
    background: "#f5f5f5",
    surface: "#ffffff",
    textPrimary: "#212121",
    textSecondary: "#757575",
    border: "#e0e0e0",
    success: "#388e3c",
    error: "#d32f2f",
    warning: "#fbc02d",
  },
   typography:{
    ...baseTheme.typography,
  },
   components: {
    ...baseTheme.components,
    input: {
      ...baseTheme.components.inputBase,
      backgroundColor: "#ffffff",
      borderColor: "#e0e0e0",
    },
    button: {
      ...baseTheme.components.buttonBase,
      backgroundColor: "#1976d2",
    },
  },
};
