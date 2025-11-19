"use client";

import { useState, useEffect, useCallback, createContext, useContext, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useThemeContext debe usarse dentro de ThemeProviderCustom");
  return ctx;
};

export function ThemeProviderCustom({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  // Detectar preferencia guardada o del sistema (con protecciones)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        setDarkMode(saved === "dark");
        return;
      }
    } catch (e) {
      // localStorage puede fallar en entornos restringidos; ignorar y continuar
    }

    try {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      if (prefersDark) setDarkMode(true);
    } catch (e) {
      // matchMedia rara vez falla; ignorar
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newMode = !prev;
      try {
        localStorage.setItem("theme", newMode ? "dark" : "light");
      } catch (e) {
        // Silenciar errores de localStorage
      }
      return newMode;
    });
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#1976d2",
          },
          secondary: {
            main: "#9c27b0",
          },
        },
      }),
    [darkMode]
  );

  const contextValue = useMemo(
    () => ({ darkMode, toggleDarkMode }),
    [darkMode, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}