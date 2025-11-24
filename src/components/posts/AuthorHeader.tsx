"use client";

import  { useEffect, useState } from "react";
import { Avatar, Box, Typography, Stack } from "@mui/material";
import getImageUrl from "@/utils/getImageUrl";
import { Author } from "../../types/post";
import WeatherBadge from "@/components/common/WeatherBadge";
import { fetchWeatherByCity } from "@/services/weatherService";
import api from "../../api/index";

interface AuthorHeaderProps {
  author: Author;
  sharedBy?: Author | null;
  actions?: React.ReactNode;
  weather?: any | null;
  postId?: string;
}

export default function AuthorHeader({ author, sharedBy, actions, weather, postId }: AuthorHeaderProps) {
  
  const [localWeather, setLocalWeather] = useState<any | null>(weather ?? null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (localWeather) return;
      try {
        if (!author) return;
        const city = (author as any).city;
        const country = (author as any).country_iso;
        // if (typeof window !== "undefined") console.log("AuthorHeader: will fetch weather for", city, country);
        if (!city) return;
        setLoadingWeather(true);
        const w = await fetchWeatherByCity(city, country);
        // if (typeof window !== "undefined") console.log("AuthorHeader: weather fetched", w);
        if (mounted) setLocalWeather(w);
      } catch (e) {
        console.warn("Failed to fetch weather for author", e);
      } finally {
        if (mounted) setLoadingWeather(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [author]);

  // If we still don't have weather, try fetching from the post endpoint (useful for older posts
  // where weather was saved on the post but not passed down).
  useEffect(() => {
    let mounted = true;
    async function loadFromPost() {
      if (localWeather) return;
      if (!postId) return;
      try {
        // if (typeof window !== "undefined") console.log("AuthorHeader: fetching post by id for weather", postId);
        const res = await api.get(`/posts/${postId}`);
        const payload = res.data?.data;
        if (payload?.weather && mounted) {
          // if (typeof window !== "undefined") console.log("AuthorHeader: weather from post endpoint", payload.weather);
          setLocalWeather(payload.weather);
        }
      } catch (e) {
        // ignore
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
      spacing={2.5}
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 3,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        position: "relative",
        pr: 8,
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
          transition: "background-color 0.3s ease",
        },
      }}
    >
      {/* Avatar del autor original */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        <Avatar
          src={getImageUrl(author.profile_picture_url) ?? "/default-avatar.png"}
          alt={author.displayname ?? author.username}
          sx={{
            width: 56,
            height: 56,
            border: "2px solid rgba(0,0,0,0.1)",
            boxShadow: 1,
          }}
        />

        <Box>
          {/* Nombre principal: autor original */}
          <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2, color: "text.primary" }}>
            {author.displayname || author.username}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontStyle: "italic" }}>
            @{author.username}
          </Typography>

          {/* Si el post fue compartido */}
          {sharedBy && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Compartido por <strong>{sharedBy.displayname || sharedBy.username}</strong>
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
        <WeatherBadge weather={localWeather} variant="inline" />
      </Box>
      <Box sx={{ position: "absolute", top: 12, right: 12 }}>{actions}</Box>
    </Stack>
  );
}
