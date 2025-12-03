"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWeatherByCity } from "@/services/weatherService";
import api from "../api/index";
import { FileUp, Wind, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  CircularProgress,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Popover,
} from "@mui/material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import EmojiPicker from "emoji-picker-react";
import { Directions } from "@mui/icons-material";

type CrearPostProps = { onCreated?: (createdPost?: any) => void };

export default function CrearPost({ onCreated }: CrearPostProps = {}) {
  const theme = useTheme();
  const { user } = useAuth();
  const [contenido, setContenido] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachWeather, setAttachWeather] = useState(false);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [visibility, setVisibility] = useState("followers");
const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);

    if (selected.length + files.length > 4) {
      toast.error("Máximo 4 archivos por post");
      e.currentTarget.value = "";
      return;
    }

    for (const f of selected) {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`El archivo ${f.name} debe ser menor a 10MB`);
        e.currentTarget.value = "";
        return;
      }
    }

    const newFiles = [...files, ...selected].slice(0, 4);
    previews.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {}
    });

    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };
  useEffect(() => {
    return () => {
      try {
        previews.forEach((u) => URL.revokeObjectURL(u));
      } catch {}
    };
  }, [previews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Debes iniciar sesión");

    if (!contenido.trim() && files.length === 0 ) {
      return toast.error("El post requiere texto o al menos un archivo.");
    }

    if (contenido.length > 300) {
      return toast.error("El contenido no puede exceder los 300 caracteres.");
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", contenido);
      formData.append("visibility", visibility);

      if (attachWeather && weatherData)
        formData.append("weather", JSON.stringify(weatherData));
      for (const f of files) formData.append("files", f);

      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const json = res.data;

      const created = json?.post || null;
      if (created) {
        created.author = created.author || {
          id: created.author_id || user?.id,
        };
        created.author.username =
          created.author.username || user?.username || "";
        created.author.displayname =
          created.author.displayname || user?.displayname || "";
        created.author.profile_picture_url =
          created.author.profile_picture_url ??
          user?.profile_picture_url ??
          null;
        created.medias = json.medias || [];
        created.weather = json.weather || null;

        try {
          window.dispatchEvent(
            new CustomEvent("post-created", { detail: created })
          );
        } catch {}
      }

      toast.success("Post creado ✨");

      setContenido("");
      setFiles([]);
      setPreviews([]);
      setAttachWeather(false);

      onCreated?.(created);
    } catch {
      toast.error("Error al crear el post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!attachWeather) return;

    if (!user?.city || !user?.country_iso || user.country_iso.trim() === "") {
      toast.error(
        "Debes agregar tu ciudad y país en tu perfil para usar el clima."
      );
      setAttachWeather(false);
      return;
    }

    (async () => {
      try {
        const w = await fetchWeatherByCity(
          user.city as string,
          user.country_iso as string
        );
        setWeatherData(w);
        toast.success("Clima agregado al post");
      } catch {
        toast.error("Error al obtener el clima. Intenta nuevamente.");
        setAttachWeather(false);
      }
    })();
  }, [attachWeather, user?.city, user?.country_iso]);

  const canSubmit = contenido.trim().length > 0 || files.length > 0;


  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        width: "100%",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Avatar
          src={user?.profile_picture_url || undefined}
          sx={{
            width: 48,
            height: 48,
            bgcolor: user?.profile_picture_url ? "transparent" : "primary.main",
            color: "white",
          }}
        >
          {!user?.profile_picture_url
            ? user?.displayname?.[0] || user?.username?.[0]
            : null}
        </Avatar>

        <Box>
          <Typography fontWeight={600}>
            {user?.displayname || user?.username}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            ¿Qué estás pensando hoy?
          </Typography>
        </Box>
        
      </Box>


       <Box sx={{ position: "relative", mb: 2 }}>
  <TextField
    fullWidth
    multiline
    minRows={1}
    maxRows={8}
    value={contenido}
    onChange={(e) => setContenido(e.target.value)}
    placeholder="Comparte tus ideas, fotos, música o clima…"
    label="Texto para post"
  />

  <Box display="flex" justifyContent="flex-start" mt={0.5}>
    <IconButton
      size="small"
      onClick={(e) => setAnchorEl(e.currentTarget)}
    >
      <EmojiEmotionsIcon fontSize="small" />
    </IconButton>
  </Box>

  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={() => setAnchorEl(null)}
    anchorOrigin={{
      vertical: "top",
      horizontal: "left",
    }}
    transformOrigin={{
      vertical: "bottom",
      horizontal: "left",
    }}
  >
    <EmojiPicker
      onEmojiClick={(emojiData: any) => {
        const emoji = emojiData.emoji;
        setContenido((prev) => (prev ?? "") + emoji);
      }}
      height={350}
    />
  </Popover>
</Box>
<Box sx={{ display: "flex", justifyContent:"space-between", alignItems:"center", gap: 1 }}>
  <Box sx={{ display: "flex", gap: 1 }}>
          <input
            id="upload-file"
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Tooltip
            title="Añadir imágenes, videos o audio"
            aria-label="Añadir imágenes, videos o audio"
          >
            <label htmlFor="upload-file" style={{ cursor: "pointer" }}>
              <IconButton
                color="primary"
                component="span"
                sx={{ bgcolor: "action.hover" }}
              >
                <FileUp size={18} />
              </IconButton>
            </label>
          </Tooltip>

          <Tooltip title="Adjuntar clima actual">
            <IconButton
              onClick={() => setAttachWeather(!attachWeather)}
              color={attachWeather ? "primary" : "default"}
              sx={{
                bgcolor: attachWeather
                  ? theme.palette.primary.light
                  : "action.hover",
              }}
            >
              <Wind size={18} />
            </IconButton>
          </Tooltip>
        </Box>
 
</Box>
        
       <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, gap:2 }} flexDirection={{xs: "column", sm: 'row',md: "row", lg: 'row'}} alignItems={{xs: "center" , sm: "center"}}>

         <FormControl  sx={{ mt: 2 }}>
          <InputLabel id="visibility-label">Visibilidad</InputLabel>
          <Select
         size="small"
            labelId="visibility-label"
            value={visibility}
            label="Visibilidad"
            onChange={(e) => setVisibility(e.target.value)}
          >
            <MenuItem value="public">Público</MenuItem>
            <MenuItem value="followers">Solo personas que te siguen</MenuItem>
            <MenuItem value="intimate">Solo yo</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", justifyContent: "flex-end"}}>
           <Button
    type="submit"
    variant="contained"
    disabled={!canSubmit || loading}
    sx={{ px: 4, borderRadius: 20 }}
  >
    {loading ? (
      <CircularProgress size={20} color="inherit" />
    ) : (
      "Publicar"
    )}
  </Button>
        </Box>
 
</Box>

      
 
      {previews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" mb={1}>
            Archivos adjuntos
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 2,
            }}
          >
            {previews.map((p, i) => (
              <Box
                key={i}
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  height: 120,
                }}
              >
                {files[i]?.type?.startsWith("video") ? (
                  <video
                    src={p}
                    controls
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : files[i]?.type?.startsWith("audio") ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: theme.palette.background.paper,
                    }}
                  >
                    <audio src={p} controls style={{ width: "90%" }} />
                  </Box>
                ) : (
                  <img
                    src={p}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <IconButton
                  onClick={() => {
                    const nf = files.filter((_, idx) => idx !== i);
                    try {
                      URL.revokeObjectURL(p);
                    } catch {}

                    setFiles(nf);
                    setPreviews(nf.map((f) => URL.createObjectURL(f)));
                    toast.success("Archivo eliminado");
                  }}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(0,0,0,0.55)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                  }}
                  size="small"
                >
                  <X size={14} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {files.length > 0 || contenido.trim() ? (
        <Button
          variant="text"
          size="small"
          sx={{ mt: 1 }}
          onClick={() => {
            setContenido("");
            setFiles([]);
            setPreviews([]);
            setAttachWeather(false);
          }}
        >
          Limpiar
        </Button>
      ) : null}
    </Box>
  );
}
