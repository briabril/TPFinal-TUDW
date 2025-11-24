"use client"

import React, { useState, useEffect } from "react"
import PostList from "@/components/posts/PostList"
import ThemeToggle from "@/components/ThemeToggle"
import CrearPost from "@/components/CrearPost"
import { Box, Typography, Button, ButtonGroup } from "@mui/material"

export default function UserFeed() {
  const [initialMode, setInitialMode] = useState<"all" | "following">("all")
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {

    try {
      const savedMode = localStorage.getItem("feedMode")

      if (savedMode === "all" || savedMode === "following") {
        setInitialMode(savedMode)
      } else {
        setInitialMode("all")
        localStorage.setItem("feedMode", "all")
      }
    }catch {
      setInitialMode("all")
    } finally {
      setHydrated(true)      
    }
  }, [])

  useEffect(() => {
     if (hydrated) {
      localStorage.setItem("feedMode", initialMode);
    } 
  }, [initialMode, hydrated])
  
  if (!hydrated) return null

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
        <Box
          id="crear-post"
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <ButtonGroup variant="outlined" aria-label="feed toggle">
            <Button
              variant={initialMode === "all" ? "contained" : "outlined"}
              onClick={() => setInitialMode("all")}
            >
              Todos
            </Button>
            <Button
              variant={initialMode === "following" ? "contained" : "outlined"}
              onClick={() => setInitialMode("following")}
            >
              Seguidos
            </Button>
          </ButtonGroup>
          <CrearPost />
        </Box>

        <Box sx={{ width: "100%" }}>
          <PostList initialMode={initialMode} />
        </Box>
      </Box>
    </Box>
  )
}
