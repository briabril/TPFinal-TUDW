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
            main: darkMode ? '#384EA3' : '#C2185B',
            contrastText: darkMode ? '#0B1020' : '#FFFFFF',
          },
          secondary: {
            main: darkMode ? '#8C82FF' : '#6C5CE7',
          },
          background: {
            default: darkMode ? '#071226' : '#FFFFFF',
            paper: darkMode ? '#071226' : '#FFFFFF',
          },
          text: {
            primary: darkMode ? '#E6EEF6' : '#0F1724',
            secondary: darkMode ? '#94A3B8' : '#6B7280',
          },
        },
      }),
    [darkMode]
  );

  useEffect(() => {
    try {
      const root = document.documentElement;
      root.classList.toggle('dark', darkMode);
      root.setAttribute('data-theme', darkMode ? 'dark' : 'light');

      const hexToRgb = (hex: string) => {
        const sanitized = hex.replace('#', '');
        const full = sanitized.length === 3 ? sanitized.split('').map(c => c + c).join('') : sanitized;
        const bigint = parseInt(full, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r} ${g} ${b}`;
      };

      const light = {
        '--color-primary': '#C2185B',  
        '--color-primary-contrast': '#FFFFFF',
        '--color-secondary': '#6C5CE7',
        '--bg': '#FFFFFF',
        '--surface': '#FFFFFF',
        '--text': '#0F1724',
        '--muted': '#6B7280',
        '--border': '#E6E9F0',
        '--accent': '#046177',
        '--success': '#16A34A',
        '--warning': '#F59E0B',
        '--danger': '#DC2626',
        '--info': '#2563EB',
      } as Record<string, string>;

      const dark = {
        '--color-primary': '#4C6FFF',
        '--color-primary-contrast': '#0B1020',
        '--color-secondary': '#8C82FF',
        '--bg': '#071226',
        '--surface': '#071226',
        '--text': '#E6EEF6',
        '--muted': '#94A3B8',
        '--border': '#192132',
        '--accent': '#26BFAA',
        '--success': '#34D399',
        '--warning': '#FBBF24',
        '--danger': '#FF6B6B',
        '--info': '#60A5FA',
      } as Record<string, string>;

      const tokens = darkMode ? dark : light;
     
      Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));

      root.style.setProperty('--background', tokens['--bg']);
      root.style.setProperty('--foreground', tokens['--text']);
      root.style.setProperty('--muted-foreground', tokens['--muted']);
      root.style.setProperty('--input', tokens['--surface']);
      root.style.setProperty('--border', tokens['--border']);
      root.style.setProperty('--accent', tokens['--accent']);
      root.style.setProperty('--accent-foreground', tokens['--color-primary-contrast']);
      try {
        root.style.setProperty('--accent-rgb', hexToRgb(tokens['--accent']));
      } catch (e) {
        root.style.setProperty('--accent-rgb', '0 191 166');
      }
      try {
        root.style.setProperty('--color-primary-rgb', hexToRgb(tokens['--color-primary']));
      } catch (e) {
        root.style.setProperty('--color-primary-rgb', '255 77 109');
      }
    } catch (e) {
    }
  }, [darkMode, theme]);

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