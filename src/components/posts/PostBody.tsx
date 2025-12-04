"use client";
import { useState, useEffect, useMemo } from "react";
import api from "@/api";
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
  Paper,
  Divider,
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
  post,
  description,
  isOwn = false,
  user,
  onDelete,
  onReport,
  editRequested,
  clearEditRequested,
}: PostBodyProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(description);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentCounter, setCommentCounter] = useState<number>(0);

  
  const [alert, setAlert] = useState<{
    type: "error" | "success" | null;
    text?: string;
  } | null>(null);
  const {
    translated,
    sourceLang,
    loading: translating,
    translate,
    clear: clearTranslation,
  } = useTranslation();

  const postId = post.id.toString();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Comment[]>(`/comments/post/${postId}`);
      setCommentCounter(data.length);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchComments();
  }, []);

  const browserLang =
    (typeof navigator !== "undefined"
      ? navigator.language || (navigator.languages && navigator.languages[0])
      : "en"
    )
      ?.slice(0, 2)
      .toUpperCase() || "EN";

  const showTranslateBtn = useMemo(() => {
    if (translated) return false;
    if (sourceLang && sourceLang.toUpperCase() === browserLang) return false;
    return true;
  }, [translated, sourceLang, browserLang]);

  useEffect(() => {
    if (editRequested) {
      setEditing(true);
      clearEditRequested?.();
    }
  }, [editRequested, clearEditRequested]);

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      await updatePost(post.id, { text });
      setAlert({ type: "success", text: "Post actualizado." });
      setEditing(false);
      window.location.reload();
    } catch (err: any) {
      setAlert({
        type: "error",
        text:
          err.response?.data?.error?.message || "Ocurrió un error al guardar.",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  const renderMedia = (media: Media, i: number) => {
    if (!media?.url) return null;

    const isVideo = media.type === "VIDEO";
    const isAudio = media.type === "AUDIO";

    return (
      <Box
        key={i}
        sx={{
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        {isVideo && (
          <CardMedia
            component="video"
            src={media.url}
            controls
            sx={{
              width: "100%",
              height: { xs: 200, sm: 320 },
              objectFit: "contain",
              background: "black",
            }}
          />
        )}

        {isAudio && (
          <CardMedia
            component="audio"
            src={media.url}
            controls
            sx={{ width: "100%" }}
          />
        )}

        {!isVideo && !isAudio && (
          <CardMedia
            component="img"
            image={media.url}
            alt="imagen del post"
            sx={{
              width: "100%",
              height: { xs: 200, sm: 320 },
              objectFit: "cover",
            }}
          />
        )}
      </Box>
    );
  };

  const medias = post.medias ?? [];

  const handleTranslate = async () => {
    await translate({ text: description, postId });
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1, pb: 2 }}>
      {editing ? (
        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Stack direction="row" spacing={1.5} mt={2} justifyContent="flex-end">
            <IconButton onClick={handleSave} disabled={loadingSave}>
              {loadingSave ? <CircularProgress size={20} /> : <Save />}
            </IconButton>
            <IconButton onClick={() => setEditing(false)}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      ) : (
        <>
          {post.shared_post && (
            <Paper
              elevation={0}
              sx={{
                borderLeft: "4px solid #1976d2",
                p: 2,
                my: 2,
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Share fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Compartido de{" "}
                  <strong>
                    {post.shared_post.author?.displayname ||
                      post.shared_post.author?.username ||
                      "usuario"}
                  </strong>
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  fontStyle: "italic",
                  whiteSpace: "pre-wrap",
                  color: "text.secondary",
                }}
              >
                {post.shared_post.text}
              </Typography>
            </Paper>
          )}
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            {translated ?? description}
          </Typography>
          {medias.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                mt: 1,
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
              {medias.map(renderMedia)}
            </Box>
          )}
       
          <Divider sx={{ my: 2 }} />

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Reaction userId={user?.id} type="post" targetId={post.id} />

              {showTranslateBtn && (
                <Tooltip title="Traducir al idioma de tu navegador">
                  <span>
                    <IconButton
                      onClick={handleTranslate}
                      disabled={translating}
                      title="Traducir al idioma de tu navegador"
                      aria-label="Traducir al idioma de tu navegador"
                    >
                      {translating ? (
                        <CircularProgress size={18} />
                      ) : (
                        <Translate />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              )}

              {translated && (
                <>
                  <Tooltip title={`Idioma detectado: ${sourceLang || "—"}`}>
                    <IconButton title="traducir" aria-label="traducir">
                      <Language />
                    </IconButton>
                  </Tooltip>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => clearTranslation()}
                    sx={{ textTransform: "none" }}
                  >
                    Ver original
                  </Button>
                </>
              )}
            </Stack>

            <Link
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ gap: 1 }}
              href={`/posts/${post.id}`}
              style={{ textDecoration: "none" }}
            >
              <MessageCircle
                size={20}
                className="text-gray-500"
                aria-label="comments"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer" }}
              >
                {commentCounter}
              </Typography>
            </Link>
          </Stack>
        </>
      )}
      {alert && (
        <Typography
          mt={2}
          color={alert.type === "error" ? "error" : "success.main"}
        >
          {alert.text}
        </Typography>
      )}
    </Box>
  );
}
