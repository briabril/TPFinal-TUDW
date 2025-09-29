"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import type { User } from "@tpfinal/types";

import {
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
} from "@mui/material";

export default function UserSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const debounceRef = useRef<number | null>(null);
  const router = useRouter();

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
        setResults(res.data.results);
      } catch (err) {
        console.error("Search error: ", err);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q]);

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <TextField
        fullWidth
        size="small"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar usuario"
        variant="outlined"
        aria-label="Buscar usuario"
      />

      {results.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            mt: 1,
            zIndex: 10,
            maxHeight: 300,
            overflowY: "auto",
          }}
          role="listbox"
        >
          <List disablePadding>
            {results.map((u) => (
              <ListItemButton
                key={u.id}
                onClick={() => router.push(`/${u.username}`)}
                sx={{ py: 1.25 }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={u.profile_picture_url ?? undefined}
                    alt={u.displayname ?? u.username}
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>

                {/* Usar slotProps en lugar de primaryTypographyProps (deprecado) */}
                <ListItemText
                  primary={u.displayname}
                  secondary={`@${u.username}`}
                  slotProps={{
                    primary: { sx: { fontWeight: 500, lineHeight: 1.1 } },
                    secondary: { sx: { color: "text.secondary", fontSize: 12 } },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
