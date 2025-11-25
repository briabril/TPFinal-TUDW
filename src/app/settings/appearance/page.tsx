"use client";

import ThemeToggle from "../../../components/ThemeToggle";
import { Box, Typography } from "@mui/material";
import Sidebar from "@/components/sidebar/Sidebar";
import SettingsSidebar from "@/components/sidebar/SettingsSidebar";

export default function AppearancePage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", width: "100%" }}>
      {/* Sidebars */}
      <Sidebar />
      <SettingsSidebar />

      {/* Contenido principal */}
      <Box sx={{ flex: 1, p: 4 }}>
        <Typography variant="h5" component="h1" sx={{ mt: 2 }}>Apariencia</Typography>
        <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
          Seleccioná el modo que prefieras:
        </Typography>

        <Box sx={{ mt: 3 }}>
          <ThemeToggle />
        </Box>
      </Box>

    </Box>
  );
}
