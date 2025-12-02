"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/api";
import type { User } from "@/types/user";
import getImageUrl from "@/utils/getImageUrl";

import {
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Fade,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";

type Props = {
  onSelect?: (user: User) => void;
  showTitle?: boolean;
};

export default function UserSearch({ onSelect, showTitle = false }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const debounceRef = useRef<number | null>(null);
  const router = useRouter();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await api.get<{ results: User[] }>("/users/search", {
          params: { search: q },
          withCredentials: true,
        });

        const qLower = q.toLowerCase();
        const sorted = res.data.results.sort((a, b) => {
          const aScore =
            (a.username.toLowerCase().startsWith(qLower) ? 2 : 0) +
            (a.displayname?.toLowerCase().includes(qLower) ? 1 : 0);

          const bScore =
            (b.username.toLowerCase().startsWith(qLower) ? 2 : 0) +
            (b.displayname?.toLowerCase().includes(qLower) ? 1 : 0);

          return bScore - aScore;
        });

        setResults(sorted);
      } catch (err) {
        console.error("Search error: ", err);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q]);

  const showResults = q.trim().length > 0;

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {showTitle && (
        <Typography
          variant="subtitle2"
          sx={{
            mb: 0.7,
            fontWeight: 700,
            color: theme.palette.text.primary,
            opacity: 0.9,
          }}
        >
          Buscar usuario
        </Typography>
      )}
      <TextField
        fullWidth
        size={isMobile ? "medium" : "small"}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar usuarios..."
        variant="outlined"
        aria-label="Buscar usuario"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "14px",
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
            transition: "all 0.25s ease",
            "&.Mui-focused": {
              boxShadow: theme.shadows[4],
            },
          },
        }}
      />

      {showResults && (
        <Fade in>
          <Paper
            elevation={10}
            sx={{
              position: "absolute",
              top: "105%",
              left: 0,
              right: 0,
              width: "100%",
              maxHeight: isMobile ? "70vh" : 340,
              overflowY: "auto",
              borderRadius: "16px",
              backdropFilter: "blur(12px)",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(30,30,30,0.85)"
                  : "rgba(255,255,255,0.85)",
              boxShadow: theme.shadows[8],
              p: 1,
              zIndex: 2000,
            }}
          >
            {results.length === 0 ? (
              <Typography
                sx={{
                  py: 2,
                  textAlign: "center",
                  color: theme.palette.text.secondary,
                }}
              >
                No se encontraron usuarios
              </Typography>
            ) : (
              <List disablePadding>
                {results.map((u, i) => (
                  <Box key={u.id}>
                    <ListItemButton
                      onClick={() => {
                        if (onSelect) {
                          onSelect(u);
                          setQ("");
                          setResults([]);
                        } else {
                          router.push(`/${u.username}`);
                        }
                      }}
                      sx={{
                        borderRadius: "12px",
                        px: 1.2,
                        py: 1.2,
                        transition: "transform 0.15s, background-color 0.15s",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.04)",
                          transform: "scale(1.01)",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={getImageUrl(u.profile_picture_url) ?? undefined}
                          alt={u.displayname ?? u.username}
                          sx={{
                            width: 42,
                            height: 42,
                            border: `2px solid ${theme.palette.background.paper}`,
                            boxShadow: theme.shadows[3],
                          }}
                        />
                      </ListItemAvatar>

                      <ListItemText
                        primary={u.displayname}
                        secondary={`@${u.username}`}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: 600,
                              fontSize: 15,
                              color: theme.palette.text.primary,
                            },
                          },
                          secondary: {
                            sx: { color: theme.palette.text.secondary },
                          },
                        }}
                      />
                    </ListItemButton>

                    {i < results.length - 1 && <Divider sx={{ my: 0.5 }} />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Fade>
      )}
    </Box>
  );
}
