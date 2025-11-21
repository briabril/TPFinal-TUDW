"use client";

import { Box, Typography } from "@mui/material";
import SettingsSidebar from "../../components/sidebar/SettingsSidebar";
import Sidebar from "../../components/sidebar/Sidebar";
export default function SettingsHome() {
  return (
    <Box sx={{ display: "flex", gap: 4, p: 4 }}>
      
        {/* Sidebar Settings*/}
      <Sidebar />
      {/* Sidebar Settings*/}
      <SettingsSidebar />

      {/* Contenido principal */}
      <Box sx={{ flex: 1 }}>
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
