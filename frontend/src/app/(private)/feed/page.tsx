"use client";

import React, { useState } from "react";
import ListaPosts from "@/components/ListaPosts";
import ThemeToggle from "@/components/ThemeToggle";
import CrearPost from "@/components/CrearPost";
import { Box, Typography } from "@mui/material";
import { Button, ButtonGroup } from "@mui/material";

export default function UserFeed() {
  const [reloadKey, setReloadKey] = useState(0);
  const [freshPost, setFreshPost] = useState<any | null>(null);
  const [mode, setMode] = useState<"all" | "following">("all");

  const handlePostCreated = (createdPost?: any) => {
    if (createdPost) {
      setFreshPost(createdPost);
      setReloadKey((prev) => prev + 1);
    } else {
      setReloadKey((prev) => prev + 1);
    }
  };

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
        <Box id="crear-post" sx={{ width: "100%", display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ButtonGroup variant="outlined" aria-label="feed toggle">
            <Button variant={mode === 'all' ? 'contained' : 'outlined'} onClick={() => setMode('all')}>Todos</Button>
            <Button variant={mode === 'following' ? 'contained' : 'outlined'} onClick={() => setMode('following')}>Seguidos</Button>
          </ButtonGroup>
          <CrearPost onCreated={handlePostCreated} />
        </Box>
        <Box sx={{ width: "100%" }}>
          <ListaPosts mode={mode} reloadKey={reloadKey} prependPost={freshPost} />
        </Box>
      </Box>
    </Box>
  );
}
