"use client";
import React, { useState } from "react";
import {
  Typography,
  Box,
  IconButton,
  TextField,
  Stack,
  CardMedia,
} from "@mui/material";
import { Save, Close } from "@mui/icons-material";
import { Media } from "@tpfinal/types";
import PostActions from "./posts/PostActions";
import { deletePost, updatePost, reportPost } from "@/services/postService";

export default function PostBody({ post, description }: any) {
  const { user } = require("@/context/AuthContext").useAuth?.() || { user: null };
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(description);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success" | null; text?: string } | null>(null);

  const isOwn = user && post.author.id === user.id;

  const getMediaUrl = (media?: Media) => media?.url ?? null;

  const handleDelete = async () => {
    if (!confirm("¿Eliminar post?")) return;
    setLoading(true);
    try {
      await deletePost(post.id);
      setMsg({ type: "success", text: "Post eliminado" });
      window.location.reload();
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.error?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePost(post.id, { text });
      setEditing(false);
      window.location.reload();
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.error?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (reason: string) => {
    setLoading(true);
    try {
      await reportPost(post.id, reason);
      setMsg({ type: "success", text: "Reporte enviado correctamente" });
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.error?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const medias = post.medias ?? [];
  const mediaUrl = medias.length > 0 ? getMediaUrl(medias[0]) : null;

  return (
    <Box sx={{ fontSize: "1.1rem" }}>
      {!editing ? (
        <>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              mt: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                whiteSpace: "pre-wrap",
                pr: { xs: 0, sm: 8 },
                width: "100%",
                fontSize: "1.1rem",
                lineHeight: 1.8,
              }}
            >
              {text}
            </Typography>

            {mediaUrl && (
              <CardMedia
                component="img"
                height="320"
                image={mediaUrl}
                alt="imagen del post"
                sx={{ objectFit: "cover", borderRadius: 2, mb: 1 }}
              />
            )}

            <PostActions
              onEdit={() => setEditing(true)}
              onDelete={handleDelete}
              onReport={handleReport}
              loading={loading}
              isOwn={isOwn}
            />
          </Box>
        </>
      ) : (
        <Box>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{
              fontSize: "1.1rem",
              "& .MuiOutlinedInput-root": {
                fontSize: "1.1rem",
                lineHeight: 1.6,
                borderRadius: 2,
              },
            }}
          />
          <Stack direction="row" spacing={1.5} mt={1.5} sx={{ justifyContent: "flex-end" }}>
            <IconButton size="medium" onClick={handleSave} disabled={loading}>
              <Save fontSize="medium" />
            </IconButton>
            <IconButton size="medium" onClick={() => setEditing(false)}>
              <Close fontSize="medium" />
            </IconButton>
          </Stack>
        </Box>
      )}

      {msg && (
        <Typography
          variant="body2"
          color={msg.type === "error" ? "error" : "success.main"}
          mt={1.5}
          display="block"
          sx={{ fontSize: "0.95rem" }}
        >
          {msg.text}
        </Typography>
      )}
    </Box>
  );
}
