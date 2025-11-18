"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Typography,
  Box,
  IconButton,
  TextField,
  Stack,
  CardMedia,
  Button,
  CircularProgress,
  Tooltip,
  Link,
} from "@mui/material";
import { Save, Close, Translate, Language, Share } from "@mui/icons-material";
import { Media } from "../../types/post";
import { Reaction } from "../Reaction";
import { updatePost } from "@/services/postService";
import useTranslation from "@/hooks/useTranslation";

interface PostBodyProps {
  post: any;
  description: string;
  isOwn?: boolean;
  onDelete?: () => void;
  onReport?: (reason: string) => void;
  editRequested?: boolean;
  clearEditRequested?: () => void;
  user?: any;
}

export default function PostBody({ post, description, isOwn = false, onDelete, onReport, editRequested, clearEditRequested, user }: PostBodyProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(description);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success" | null; text?: string } | null>(null);
  const { translated, sourceLang, loading: tlLoading, error: tlError, translate, clear } = useTranslation();

  const postId = post.id.toString();

  const browserLang =
    (typeof navigator !== "undefined"
      ? navigator.language || (navigator.languages && navigator.languages[0])
      : "en")?.slice(0, 2).toUpperCase() || "EN";

  const showTranslateButton = useMemo(() => {
    if (translated) return false;
    if (sourceLang && sourceLang.toUpperCase() === browserLang) return false;
    return true;
  }, [translated, sourceLang, browserLang]);

  const getMediaUrl = (media?: Media) => media?.url ?? null;


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


  useEffect(() => {
    if (editRequested) {
      setEditing(true);
      clearEditRequested?.();
    }
  }, [editRequested, clearEditRequested]);

  const medias = post.medias ?? [];

  const renderMediaItem = (media: Media, idx: number) => {
    const url = getMediaUrl(media);
    if (!url) return null;

    const isAudio = media.type === "AUDIO";
    const isVideo = media.type === "VIDEO";

    return (
      <Box
        key={idx}
        sx={{
          width: "100%",
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
              height: { xs: 200, sm: 320 },
              objectFit: "contain",
              backgroundColor: "black",
            }}
          />
        ) : isAudio ? (
          <CardMedia component="audio" src={url} controls sx={{ width: "100%" }} />
        ) : (
          <CardMedia
            component="img"
            image={url}
            alt={`media-${idx}`}
            sx={{
              width: "100%",
              height: { xs: 200, sm: 320 },
              objectFit: "contain",
            }}
          />
        )}
      </Box>
    );
  };

  const handleTranslateClick = async () => {
    await translate({ text: description, postId });
  };

  const handleClearTranslation = () => {
    clear();
  };

  return (
    <Box sx={{ fontSize: "1.1rem", width: "100%", px: { xs: 1, sm: 2 } }}>
      {!editing ? (
        <>
          {post.shared_post && (
            <Box
              sx={{
                borderLeft: "4px solid #1976d2",
                borderRadius: 2,
                p: { xs: 1.5, sm: 2 },
                mt: 2,
                mb: 2,
                bgcolor: "background.paper",
                boxShadow: 1,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={0.5}
                alignItems={{ xs: "flex-start", sm: "center" }}
                mb={1}
              >
                <Share fontSize="small" color="primary" />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordBreak: "break-word" }}
                >
                  Compartido de{" "}
                  <strong>
                    {post.shared_post.author?.username ||
                      post.shared_post.author?.displayname ||
                      "usuario desconocido"}
                  </strong>
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontStyle: "italic",
                  color: "text.secondary",
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
              >
                {post.shared_post.text}
              </Typography>
            </Box>
          )}

          {/* Texto del post */}
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              whiteSpace: "pre-wrap",
              width: "100%",
              fontSize: { xs: "1rem", sm: "1.1rem" },
              lineHeight: 1.8,
              wordBreak: "break-word",
            }}
          >
            {translated ?? text}
          </Typography>

          {/* Medias */}
          {medias.length > 0 && (
            <Box
              sx={{
                width: "100%",
                mt: 1,
                display: "grid",
                gap: 1,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm:
                    medias.length === 2
                      ? "repeat(2, 1fr)"
                      : medias.length >= 3
                        ? "repeat(3, 1fr)"
                        : "1fr",
                },
              }}
            >
              {medias.map((m: Media, i: number) => renderMediaItem(m, i))}
            </Box>
          )}

          {/* Acciones */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mt: 1, alignItems: { xs: "stretch", sm: "center" } }}
          >
            </Stack>
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
              fontSize: { xs: "1rem", sm: "1.1rem" },
              "& .MuiOutlinedInput-root": {
                fontSize: { xs: "1rem", sm: "1.1rem" },
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
          sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
        >
          {msg.text}
        </Typography>
      )}

      <Stack
        direction={{ xs: "row", sm: "row" }}
        alignItems="center"
        spacing={1.5}
        sx={{
          p: 1.5,
          mt: 1,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* Reacciones */}
          <Reaction userId={user?.id} type="post" targetId={post.id} />

          {/* Traducción junto a reacciones */}
          {showTranslateButton && (
            <Tooltip title="Traducir al idioma de tu navegador">
              <span>
                <IconButton onClick={handleTranslateClick} disabled={tlLoading}>
                  {tlLoading ? <CircularProgress size={18} /> : <Translate />}
                </IconButton>
              </span>
            </Tooltip>
          )}

          {translated && (
            <>
              <Tooltip title={`Detectado: ${sourceLang ?? "—"}`}>
                <IconButton aria-label="source-language">
                  <Language />
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                variant="outlined"
                onClick={handleClearTranslation}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  textTransform: "none",
                }}
              >
                Ver original
              </Button>
            </>
          )}
        </Stack>

        <Link
          href={`/posts/${post.id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Typography
            variant="body2"
            color="primary"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Comentarios
          </Typography>
        </Link>
      </Stack>
    </Box>
  );
}
