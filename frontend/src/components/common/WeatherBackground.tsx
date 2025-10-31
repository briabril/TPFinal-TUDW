"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";
import api from "@tpfinal/api";

interface Props {
  weather?: any | null;
  children?: React.ReactNode;
  className?: string;
  overlayOpacity?: number;
  imageOpacity?: number;
}

export default function WeatherBackground({ weather, children, className, overlayOpacity = 0, imageOpacity = 1 }: Props) {
  const [bgUrl, setBgUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!weather || !weather.current) return;
        const weatherMain = weather.current?.weather?.[0]?.main;
        if (!weatherMain) return;

        const map: Record<string, string> = {
          Clear: "sunny sky",
          Clouds: "cloudy sky",
          Rain: "rain clouds",
          Drizzle: "light rain",
          Snow: "snow landscape",
          Thunderstorm: "storm lightning",
          Mist: "misty landscape",
          Smoke: "hazy sky",
          Haze: "hazy sky",
          Dust: "dusty landscape",
          Fog: "foggy landscape",
          Sand: "desert sand",
          Ash: "volcanic ash sky",
          Squall: "stormy sky",
          Tornado: "tornado storm",
        };

        const base = map[weatherMain] || weatherMain;
        const query = `${base}, landscape`;

        setLoading(true);
        try {
          const res = await api.get("/photo", { params: { query } });
          const url = res.data?.url;
          if (mounted && url) {
            setBgUrl(url);
            setLoading(false);
            return;
          }
        } catch (err) {
        }

        if (mounted) setBgUrl(`https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`);
      } catch (e) {
        console.warn("WeatherBackground error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [weather]);

  return (
    <Box className={className} sx={{ position: "relative", width: "100%" }}>
      {bgUrl && (
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0, opacity: imageOpacity }} />
      )}
      {bgUrl && overlayOpacity > 0 && (
        <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,${overlayOpacity}))`, zIndex: 1 }} />
      )}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        {children}
      </Box>
      {loading && (
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 3 }}>
          <CircularProgress size={20} color="inherit" />
        </Box>
      )}
    </Box>
  );
}
