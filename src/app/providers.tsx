"use client";

//import { QueryClientProvider } from "@tanstack/react-query";
//import { queryClient } from "@/lib/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProviderCustom } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    //<QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProviderCustom>
          {children}
          <Toaster position="top-center" />
        </ThemeProviderCustom>
      </AuthProvider>
    //</QueryClientProvider>
  );
}
