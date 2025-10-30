"use client";

import React from "react";
import ListaPosts from "@/components/posts/PostList";
import ThemeToggle from "@/components/ThemeToggle";
import { Box, Typography } from "@mui/material";

export default function UserFeed() {
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
      <Typography
        variant="h4"
        fontWeight={600}
        sx={{ mb: 4, textAlign: "center" }}
      >
        Mi Feed
      </Typography>
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ListaPosts />
      </Box>
    </Box>
  );
}
