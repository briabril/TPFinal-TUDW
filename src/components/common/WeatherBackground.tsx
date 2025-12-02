"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";
import api from "@/api";

interface Props {
  weather?: any | null;
  children?: React.ReactNode;
  className?: string;
  overlayOpacity?: number;
  imageOpacity?: number;
  postId?: string;
}

export default function WeatherBackground({ weather, children, className, overlayOpacity = 0, imageOpacity = 1, postId }: Props) {
  const [bgUrl, setBgUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [localWeather, setLocalWeather] = React.useState<any | null>(weather ?? null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
      } catch (e) {}
      try {
        if ((!weather || !weather.current) && postId) {
            try {
            const res = await api.get(`/posts/${postId}`);
            const payload = res.data?.data;
            if (payload?.weather) {
              setLocalWeather(payload.weather);
            }
          } catch (e) {
            
          }
        }

        const effectiveWeather = localWeather || weather;
        if (!effectiveWeather) return;

        const weatherMain =
          effectiveWeather.current?.weather?.[0]?.main ||
          effectiveWeather.current?.weatherMain ||
          effectiveWeather.current?.condition?.text ||
          effectiveWeather.current?.description ||
          effectiveWeather.current?.summary ||
          effectiveWeather.current?.icon ||
          effectiveWeather?.location?.weather ||
          effectiveWeather?.location?.city ||
          effectiveWeather?.location?.name ||
          null;
        let base = weatherMain;
        if (!base) {
          if (effectiveWeather?.location?.city) base = effectiveWeather.location.city;
          else if (effectiveWeather?.location?.name) base = effectiveWeather.location.name;
          else base = 'weather';
        }

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

    const baseMapped = map[weatherMain] || base || 'weather';
    const query = `${baseMapped}, landscape`;

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

        if (mounted) {
          const fallback = `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`;
          setBgUrl(fallback);
        }
      } catch (e) {
        
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [weather, postId]);

  return (
    <Box className={className} sx={{ position: "relative", width: "100%" }}>
      {bgUrl && (
        <img
          src={bgUrl}
          alt="weather background"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: imageOpacity }}
        />
      )}
      {/* background is rendered via the <img> above; avoid rendering a second background node to prevent duplicate painting/requests */}
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
