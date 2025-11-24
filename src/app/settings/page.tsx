"use client";

import { Box, Typography } from "@mui/material";
import SettingsSidebar from "../../components/sidebar/SettingsSidebar";
import Sidebar from "../../components/sidebar/Sidebar";
export default function SettingsHome() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", width: "100%" }}>
      {/* Sidebars */}
      <Sidebar />
      <SettingsSidebar />

      {/* Contenido principal */}
      <Box sx={{ flex: 1, p: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={2}>
          Configuración
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Seleccioná una categoría del menú para modificar tus ajustes.
        </Typography>
      </Box>
    </Box>
  );
}
