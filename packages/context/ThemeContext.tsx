import React, { createContext, useState, useContext, useMemo } from "react";
import { lightTheme } from "../ui/light";
import { darkTheme } from "../ui/dark";

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  theme: typeof lightTheme | typeof darkTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext debe usarse dentro de ThemeProviderCustom");
  return ctx;
};

export const ThemeProviderCustom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const value = useMemo(() => ({ darkMode, toggleDarkMode, theme }), [darkMode, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
