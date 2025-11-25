"use client";

import { useEffect, useState } from "react";
import { Avatar, Box, Typography, Stack } from "@mui/material";
import getImageUrl from "@/utils/getImageUrl";
import { Author } from "../../types/post";
import WeatherBadge from "@/components/common/WeatherBadge";
import { fetchWeatherByCity } from "@/services/weatherService";
import api from "../../api/index";
import { useRouter } from "next/navigation";

interface AuthorHeaderProps {
  author: Author;
  sharedBy?: Author | null;
  actions?: React.ReactNode;
  weather?: any | null;
  postId?: string;
  createdAt?: string;
}

export default function AuthorHeader({
  author,
  sharedBy,
  actions,
  weather,
  postId,
  createdAt,
}: AuthorHeaderProps) {
  const router = useRouter();
  const [localWeather, setLocalWeather] = useState<any | null>(weather ?? null);

  const city = (author as any)?.city;
  const country = (author as any)?.country_iso;

  const goToProfile = () => {
    router.push(`/${author.username}`);
  };

  // Cargar clima desde ciudad del autor
  useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      if (localWeather || !city) return;

      try {
        const w = await fetchWeatherByCity(city, country);
        if (mounted) setLocalWeather(w);
      } catch (e) {
        console.warn("Weather fetch failed", e);
      }
    }

    loadWeather();
    return () => { mounted = false };
  }, [city, country, localWeather]);

  // Cargar desde el post si no hay datos
  useEffect(() => {
    let mounted = true;

    async function loadFromPost() {
      if (localWeather || !postId) return;

      try {
        const res = await api.get(`/posts/${postId}`);
        const payload = res.data?.data;
        if (mounted && payload?.weather) setLocalWeather(payload.weather);
      } catch (e) {
        console.warn("Post weather fetch failed", e);
      }
    }

    loadFromPost();
    return () => { mounted = false };
  }, [postId, localWeather]);

  if (!author) return null;

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        width: "100%",
        px: 2,
        py: 1.5,
        gap: 1.5,

        borderBottom: "1px solid rgba(0,0,0,0.06)",

        position: "relative",
        zIndex: 3,
      }}
    >

      <Avatar
        src={getImageUrl(author.profile_picture_url)}
        alt={author.username}
        onClick={goToProfile}
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          cursor: "pointer",
          transition: "opacity 0.2s",
          "&:hover": { opacity: 0.85 },
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          "&:hover": { opacity: 0.85 },
        }}
        onClick={goToProfile}
      >
        <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
          {author.displayname || author.username}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          @{author.username} • {createdAt || ""}
        </Typography>

        {sharedBy && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.4 }}
          >
            Compartido por {sharedBy.displayname || sharedBy.username}
          </Typography>
        )}
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {localWeather && (
        <Box sx={{ mr: 1 }}>
          <WeatherBadge weather={localWeather} variant="inline" />
        </Box>
      )}

      {actions}
    </Stack>
  );
}
