"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { Sun } from "lucide-react";

interface WeatherBadgeProps {
  weather?: any | null;
  variant?: "inline" | "stack" | "compact";
}

export default function WeatherBadge({ weather, variant = "inline" }: WeatherBadgeProps) {
  if (!weather || !weather.current || !weather.current.temp || !weather.current.weather) return null;

  const temp = Math.round(weather.current.temp);
  const desc = weather.current.weather?.[0]?.description;

  const baseSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.6,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 2,
    px: variant === "compact" ? 0.6 : 1,
    py: variant === "compact" ? 0.2 : 0.5,
  } as const;

  return (
    <Box sx={baseSx}>
      <Sun size={14} />
      <Box sx={{ textAlign: "left" }}>
        <Typography variant={variant === "compact" ? "caption" : "body2"} fontWeight={700}>
          {temp}°
        </Typography>
        {variant !== "compact" && (
          <Typography variant="caption" color="text.secondary">
            {desc}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
