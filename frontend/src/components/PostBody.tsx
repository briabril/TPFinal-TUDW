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
 
  const renderMediaItem = (media: Media, idx: number) => {
    const url = getMediaUrl(media);
    if (!url) return null;

    const isAudio = media.type === "AUDIO";
    const isVideo = media.type === "VIDEO";
    const containerHeight = isAudio ? 96 : 320;

    return (
      <Box
        key={idx}
        sx={{
          width: "100%",
          height: containerHeight,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        {isVideo ? (
          <CardMedia
            component="video"
            src={url}
            controls
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "black",
            }}
          />
        ) : isAudio ? (
          <CardMedia
            component="audio"
            src={url}
            controls
            sx={{
              width: "100%",
            }}
          />
        ) : (
          <CardMedia
            component="img"
            image={url}
            alt={`media-${idx}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </Box>
    );
  };

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

            {medias.length > 0 && (
              <Box
                sx={{
                  width: "100%",
                  mt: 1,
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: medias.length <= 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                    md:
                      medias.length >= 4
                        ? "repeat(2, minmax(0, 1fr))"
                        : medias.length === 3
                        ? "repeat(3, minmax(0, 1fr))"
                        : medias.length === 2
                        ? "repeat(2, minmax(0, 1fr))"
                        : "1fr",
                  },
                }}
              >
                {medias.map((m: Media, i: number) => renderMediaItem(m, i))}
              </Box>
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
