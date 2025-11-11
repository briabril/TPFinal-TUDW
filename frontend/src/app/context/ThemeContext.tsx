import { ThemeProviderCustom, useThemeContext } from "@tpfinal/context/ThemeContext";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useMemo } from "react";
function MUIWrapper({ children }: { children: React.ReactNode }) {
  const { darkMode } = useThemeContext();

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#1976d2" },
          secondary: { main: "#9c27b0" },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderCustom>
      <MUIWrapper>{children}</MUIWrapper>
    </ThemeProviderCustom>
  );
}
