"use client";

import { Box, Typography } from "@mui/material";
import SettingsPanel from "@/components/sidebar/SettingsPanel";
export default function SettingsHome() {
  return (
    <Box sx={{ display: "flex" }}>
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
