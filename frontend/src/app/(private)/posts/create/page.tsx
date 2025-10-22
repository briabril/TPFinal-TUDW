"use client";

import React from "react";
import CrearPost from "@/components/CreatePost";
import { Container, Box, Typography } from "@mui/material";
import ThemeToggle from "@/components/ThemeToggle";
export default function CreatePostPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
       <div className="absolute top-3 right-60">
         <ThemeToggle  />
      </div>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5">Crear Post</Typography>
        <Typography color="text.secondary">— comparte novedades con la comunidad</Typography>
      </Box>

      <CrearPost />
    </Container>
  );
}
