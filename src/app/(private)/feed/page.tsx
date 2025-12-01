"use client"

import React, { useState, useEffect } from "react"
import PostList from "@/components/posts/PostList"
import ThemeToggle from "@/components/ThemeToggle"
import CrearPost from "@/components/CrearPost"
import { Box, Typography, Button, ButtonGroup, useTheme } from "@mui/material"

export default function UserFeed() {
  const theme = useTheme()

  const [feedMode, setFeedMode] = useState<"all" | "following">("all")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("feedMode")
      if (saved === "all" || saved === "following") {
        setFeedMode(saved)
      } else {
        localStorage.setItem("feedMode", "all")
      }
    } catch {
      setFeedMode("all")
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("feedMode", feedMode)
    }
  }, [feedMode, hydrated])

  if (!hydrated) return null

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
        component="h1"
        fontWeight={600}
        sx={{ mb: 1, textAlign: "center" }}
      >
        Feed
      </Typography>

      <Box
        sx={{
          width: "100%",
          maxWidth: 800,
          display: "flex",
          flexDirection: "column",
          mb: 3
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            borderBottom: "1px solid",
            borderColor: theme.palette.divider,
            mb: 2,
          }}
        >
          {[
            { key: "all", label: "Todos" },
            { key: "following", label: "Seguidos" },
          ].map((item) => {
            const active = feedMode === item.key

            return (
              <Box
                key={item.key}
                onClick={() => setFeedMode(item.key as "all" | "following")}
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 2,
                  cursor: "pointer",
                  position: "relative",
                  color: active ? "primary.main" : "text.secondary",
                  "&:hover": { color: "primary.main" },
                  transition: "color 0.2s",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" component="h2" fontWeight={active ? 600 : 400}>
                  {item.label}
                </Typography>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: active ? 4 : 2,
                    backgroundColor: active ? "primary.main" : "transparent",
                    transition: "all 0.25s",
                    borderRadius: 2,
                  }}
                />
              </Box>
            )
          })}
        </Box>
        <CrearPost />
      </Box>
      <PostList mode={feedMode} />
    </Box>
  )
}
