"use client";

import React, { useState } from "react";
import ListaPosts from "@/components/ListaPosts";
import ThemeToggle from "@/components/ThemeToggle";
import CrearPost from "@/components/CrearPost";
import { Box, Typography } from "@mui/material";

export default function UserFeed() {
  const [reloadKey, setReloadKey] = useState(0);

  const handlePostCreated = () => setReloadKey((prev) => prev + 1);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        pt: 6,
        px: 2,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 32 }}>
        <ThemeToggle />
      </Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 4, textAlign: "center" }}>
        Mi Feed
      </Typography>
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Box id="crear-post" sx={{ width: "100%" }}>
          <CrearPost onCreated={handlePostCreated} />
        </Box>
        <Box sx={{ width: "100%" }}>
          <ListaPosts reloadKey={reloadKey} />
        </Box>
      </Box>
    </Box>
  );
}
