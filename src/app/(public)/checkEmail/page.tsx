"use client";

import { Box, Paper, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function CheckEmail() {
  const router = useRouter();

  return (
    <Box
      minHeight="70vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
    >
      <Paper elevation={6} sx={{ p: 4, maxWidth: 600, width: "100%", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Registro exitoso
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Te enviamos un correo de verificación. Hacé click en el enlace del email para activar tu cuenta.
        </Typography>

        <Box display="flex" gap={2} justifyContent="center">
          <Button variant="contained" color="primary" onClick={() => router.push("/login")}>Ir al login</Button>
          <Button variant="outlined" onClick={() => router.push("/register")}>Volver a registrarme</Button>
        </Box>
      </Paper>
    </Box>
  );
}
