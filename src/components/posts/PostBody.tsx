"use client";
import { useState, useEffect, useMemo } from "react";
import api from "@/api";
import {
  Typography, Box, IconButton, TextField, Stack, CardMedia, Button,
  CircularProgress, Tooltip, Link, Paper, Divider, Modal
} from "@mui/material";
import { Save, Close, Translate, Language, Share } from "@mui/icons-material";
import { Media } from "../../types/post";
import { Reaction } from "../Reaction";
import { updatePost } from "@/services/postService";
import useTranslation from "@/hooks/useTranslation";
import { MessageCircle } from "lucide-react";

interface PostBodyProps {
  post: any;
  description: string;
  isOwn?: boolean;
  user?: any;
  onDelete?: () => void;
  onReport?: (reason: string) => void;
  editRequested?: boolean;
  clearEditRequested?: () => void;
}

export default function PostBody({
  post, description, isOwn = false, user,
  onDelete, onReport, editRequested, clearEditRequested,
}: PostBodyProps) {

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(description);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentCounter, setCommentCounter] = useState<number>(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [alert, setAlert] = useState<{ type: "error" | "success" | null; text?: string; } | null>(null);

  const { translated, sourceLang, loading: translating, translate, clear: clearTranslation } = useTranslation();

  const postId = post.id.toString();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Comment[]>(`/comments/post/${postId}`);
      setCommentCounter(data.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, []);

  const browserLang = (typeof navigator !== "undefined"
    ? navigator.language || navigator.languages?.[0]
    : "en"
  )?.slice(0, 2).toUpperCase() || "EN";

  const showTranslateBtn = useMemo(() => {
    if (translated) return false;
    if (sourceLang?.toUpperCase() === browserLang) return false;
    return true;
  }, [translated, sourceLang, browserLang]);

  useEffect(() => {
    if (editRequested) {
      setEditing(true);
      clearEditRequested?.();
    }
  }, [editRequested]);

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      await updatePost(post.id, { text });
      setAlert({ type: "success", text: "Post actualizado." });
      setEditing(false);
      window.location.reload();
    } catch (err: any) {
      setAlert({ type: "error", text: err.response?.data?.error?.message || "Error al guardar" });
    } finally { setLoadingSave(false); }
  };

  const medias: Media[] = Array.isArray(post.medias) ? post.medias : [];

  const openViewer = (index: number) => {
    if (!medias[index]) return;
    setActiveIndex(index);
    setViewerOpen(true);
  }

  const nextMedia = () => setActiveIndex(i => (i + 1) % medias.length);
  const prevMedia = () => setActiveIndex(i => (i - 1 + medias.length) % medias.length);

  const handleTranslate = async () => await translate({ text: description, postId });

  /* === Render Images/Videos con estilo más uniforme === */
  const renderMedia = (media: Media, i: number) => {
    if (!media?.url) return null;
    const isVideo = media.type === "VIDEO";
    const isAudio = media.type === "AUDIO";

    return (
      <Box
        key={i}
        onClick={() => openViewer(i)}
        sx={{
          position: "relative",
          cursor: "pointer",
          borderRadius: 2,
          overflow: "hidden",
          aspectRatio: "1/1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#111",
          "&:hover img, &:hover video": { transform: "scale(1.05)" }
        }}
      >
        {isVideo ? (
          <CardMedia
            component="video"
            src={media.url}
            controls
            sx={{ width: "100%", height: "100%", objectFit: "cover", transition: ".3s" }}
          />
        ) : isAudio ? (
          <CardMedia
            component="audio"
            src={media.url}
            controls
            sx={{ width: "100%" }}
          />
        ) : (
          <CardMedia
            component="img"
            image={media.url}
            alt="imagen"
            sx={{ width: "100%", height: "100%", objectFit: "cover", transition: ".3s" }}
          />
        )}
      </Box>
    );
  };


  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1, pb: 2 }}>

      {editing ? (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <TextField fullWidth multiline minRows={4} value={text}
            onChange={(e) => setText(e.target.value)} />
          <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
            <IconButton onClick={handleSave} disabled={loadingSave}>
              {loadingSave ? <CircularProgress size={20} /> : <Save />}
            </IconButton>
            <IconButton onClick={() => setEditing(false)}><Close /></IconButton>
          </Stack>
        </Paper>
      ) : (

        <>
          {post.shared_post && (
            <Paper sx={{ borderLeft: "4px solid #1976d2", p: 2, my: 2 }}>
              <Stack direction="row" spacing={1} mb={1}>
                <Share fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Compartido de <strong>{post.shared_post.author?.displayname || "usuario"}</strong>
                </Typography>
              </Stack>
              <Typography sx={{ whiteSpace: "pre-wrap", fontStyle: "italic" }} color="text.secondary">
                {post.shared_post.text}
              </Typography>
            </Paper>
          )}

          <Typography sx={{ whiteSpace: "pre-wrap", mb: 2, lineHeight: 1.8 }}>
            {translated ?? description}
          </Typography>

          {medias.length > 0 && (
            <Box sx={{
              mt: 2, gap: 1.5,
              display: "grid",
              gridTemplateColumns:
                medias.length === 1 ? "1fr"
                  : medias.length === 2 ? "1fr 1fr"
                    : "repeat(auto-fit,minmax(150px,1fr))"
            }}>
              {medias.map(renderMedia)}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" justifyContent="space-between">

            <Stack direction="row" spacing={1}>
              <Reaction userId={user?.id} type="post" targetId={post.id} />

              {showTranslateBtn && (
                <Tooltip title="Traducir">
                  <span>
                    <IconButton onClick={handleTranslate} disabled={translating}>
                      {translating ? <CircularProgress size={18} /> : <Translate />}
                    </IconButton>
                  </span>
                </Tooltip>
              )}

              {translated && (
                <>
                  <Tooltip title={`Idioma detectado: ${sourceLang || "N/A"}`}>
                    <IconButton><Language /></IconButton>
                  </Tooltip>
                  <Button size="small" variant="outlined" onClick={clearTranslation}>Ver original</Button>
                </>
              )}
            </Stack>

            <Link href={`/posts/${post.id}`} style={{ textDecoration: "none" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <MessageCircle size={20} />
                <Typography variant="body2" color="text.secondary">{commentCounter}</Typography>
              </Stack>
            </Link>
          </Stack>
        </>
      )}

      {alert && <Typography mt={2} color={alert.type === "error" ? "error" : "success.main"}>{alert.text}</Typography>}
      {/* 🔥 VIEWER DE MEDIAS REESTILIZADO */}
      <Modal open={viewerOpen} onClose={() => setViewerOpen(false)}>
        <Box sx={{
          position: "fixed",
          inset: 0,
          backdropFilter: "blur(6px)",
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          zIndex: 2000
        }}>

          <Box sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 0 25px rgba(0,0,0,.9)",
            bgcolor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn .35s ease",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "scale(.96)" },
              to: { opacity: 1, transform: "scale(1)" }
            }
          }}>

            {/* CONTENIDO MEDIA */}
            {medias[activeIndex]?.url ? (
              medias[activeIndex].type === "VIDEO" ?
                <video
                  src={medias[activeIndex].url}
                  controls
                  autoPlay
                  style={{ maxHeight: "85vh", maxWidth: "100%", borderRadius: 8 }}
                />
                :
                medias[activeIndex].type === "AUDIO" ?
                  <audio src={medias[activeIndex].url} controls style={{ width: "100%" }} />
                  :
                  <img
                    src={medias[activeIndex].url}
                    style={{
                      maxHeight: "85vh",
                      maxWidth: "100%",
                      objectFit: "contain"
                    }}
                  />
            ) : (
              <Typography color="white">Media no disponible</Typography>
            )}

            {/* BOTÓN CERRAR ❌ */}
            <IconButton
              onClick={() => setViewerOpen(false)}
              sx={{
                position: "absolute", top: 10, right: 10,
                bgcolor: "rgba(0,0,0,.5)", color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,.25)" }
              }}
            >
              <Close />
            </IconButton>

            {/* Flechas navegación SOLO si hay más de 1 media */}
            {medias.length > 1 && (
              <>
                <IconButton
                  onClick={prevMedia}
                  sx={{
                    position: "absolute", left: 15, top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0,0,0,.45)", color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,.25)" },
                    fontSize: 28, p: 1.2
                  }}>‹</IconButton>

                <IconButton
                  onClick={nextMedia}
                  sx={{
                    position: "absolute", right: 15, top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0,0,0,.45)", color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,.25)" },
                    fontSize: 28, p: 1.2
                  }}>›</IconButton>
              </>
            )}
            {medias.length > 1 && (
              <Stack direction="row" spacing={1} sx={{
                position: "absolute", bottom: 15, width: "100%",
                justifyContent: "center"
              }}>
                {medias.map((_, i) => (
                  <Box key={i} onClick={() => setActiveIndex(i)}
                    sx={{
                      width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
                      bgcolor: i === activeIndex ? "white" : "rgba(255,255,255,.4)",
                      transition: ".2s"
                    }}
                  />
                ))}
              </Stack>
            )}

          </Box>
        </Box>
      </Modal>
    </Box>);
}
