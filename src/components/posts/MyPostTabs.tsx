"use client";

import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import PostList from "./PostList";

export default function MyPostsTabs() {
  const [tab, setTab] = useState("all");

  const handleChange = (_: any, newValue: string) => {
    setTab(newValue);
  };

  const visibility =
    tab === "all" ? undefined : tab; 
  if (!tab) return null;
  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <Tabs
        value={tab}
        onChange={handleChange}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Todos" value="all" />
        <Tab label="Públicos" value="public" />
        <Tab label="Solo Seguidores" value="followers" />
        <Tab label="Íntimos" value="intimate" />
      </Tabs>

      <PostList  key={tab} mode="mine" visibility={visibility} />
    </Box>
  );
}
