"use client";

import ThemeToggle from "../../../../components/ThemeToggle";
import { Box, Typography } from "@mui/material";
import Sidebar from "@/components/sidebar/Sidebar";
import SettingsSidebar from "@/components/sidebar/SettingsPanel";

export default function AppearancePage() {
  return (
    <Box sx={{ display: "flex", gap: 4, p: 4 }}>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" sx={{ mt: 2 }}>Apariencia</Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>
          Seleccioná el modo que prefieras:
        </Typography>

        <Box sx={{ mt: 3 }}>
          <ThemeToggle />
        </Box>
      </Box>

    </Box>
  );
}
