"use client";

import React, { useEffect, useState } from "react";
import { Avatar, Box, Typography, Stack, Divider } from "@mui/material";
import { User } from "@tpfinal/types";
import api from "@tpfinal/api";
import WeatherBadge from "@/components/common/WeatherBadge";

interface AuthorHeaderProps {
  authorId: string;
  weather?: any | null;
}

export default function AuthorHeader({ authorId, weather }: AuthorHeaderProps) {
  const [author, setAuthor] = useState<User | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const { data } = await api.get<User>(`/users/by-id/${authorId}`);
        setAuthor(data);
      } catch (error) {
        console.error("Error al obtener el autor:", error);
      }
    };
    if (authorId) fetchAuthor();
  }, [authorId]);

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
        pr: 8,
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
          transition: "background-color 0.3s ease",
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <Avatar
          src={author.profile_picture_url || "/default-avatar.png"}
          alt={author.displayname || author.username}
          sx={{
            width: 56,
            height: 56,
            border: "2px solid rgba(0,0,0,0.1)",
            boxShadow: 1,
          }}
        />
        <Box>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ lineHeight: 1.2, color: "text.primary" }}
          >
            {author.displayname || author.username}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.3, fontStyle: "italic" }}
          >
            @{author.username}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
        <WeatherBadge weather={weather} variant="inline" />
      </Box>
    </Stack>
  );
}
