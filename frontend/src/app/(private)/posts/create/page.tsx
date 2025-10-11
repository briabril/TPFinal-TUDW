"use client";

import React from "react";
import CrearPost from "@/components/CrearPost";
import { Container, Box, Typography } from "@mui/material";

export default function CreatePostPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5">Crear Post</Typography>
        <Typography color="text.secondary">— comparte novedades con la comunidad</Typography>
      </Box>

      <CrearPost />
    </Container>
  );
}
