"use client";

import { Toaster } from "react-hot-toast";
import { HeroUIProvider } from "@heroui/react";

export  function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
      <Toaster position="top-right" />
    </HeroUIProvider>
  );
}
