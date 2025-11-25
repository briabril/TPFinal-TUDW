"use client";

import { Box } from "@mui/material";
import SettingsPanel from "@/components/sidebar/SettingsPanel";
import type { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SettingsPanel />

      {/* Contenido dinámico */}
      <Box sx={{ flex: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
