"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/api";
import type { User } from "@/types/user";
import getImageUrl from "@/utils/getImageUrl";

import {
  Box,
  Avatar,
  Typography,
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";

export default function SearchPanel({ onClose }: { onClose?: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const debounceRef = useRef<number | null>(null);
  const router = useRouter();

  // search logic
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
        console.error("search error", err);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q]);

  return (
    <Box sx={{ width: "100%", height: "100%", p: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 700 }}
      >
        Búsqueda
      </Typography>

      <Box
        sx={{
          mb: 3,
          pb: 1,
          borderBottom: "1px solid #dbdbdb",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar usuarios..."
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: "1rem",
            paddingBottom: "6px",
          }}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <AnimatePresence>
          {results.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 0",
                cursor: "pointer",
              }}
              onClick={() => {
                router.push(`/${u.username}`);
                if (onClose) onClose();
              }}
            >
              <Avatar
                src={getImageUrl(u.profile_picture_url) ?? undefined}
                sx={{ width: 48, height: 48, mr: 2 }}
              />

              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  {u.displayname}
                </Typography>
                <Typography sx={{ color: "gray", fontSize: "0.85rem" }}>
                  @{u.username}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {q.trim() === "" && (
          <Typography sx={{ color: "gray", mt: 1 }}>
            Recientes (pronto)
          </Typography>
        )}
      </Box>
    </Box>
  );
}
