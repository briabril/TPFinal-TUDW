"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProviderCustom } from "./context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProviderCustom>
        {children}
        <Toaster position="top-center" />
      </ThemeProviderCustom>
    </AuthProvider>
  );
}
