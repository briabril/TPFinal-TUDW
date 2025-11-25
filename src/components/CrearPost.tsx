"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWeatherByCity } from "@/services/weatherService";
import api from "../api/index";
import { FileUp, Wind, X } from "lucide-react";
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

type CrearPostProps = {
  onCreated?: (createdPost?: any) => void;
};

export default function CrearPost({ onCreated }: CrearPostProps = {}) {
  const [contenido, setContenido] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string | null }>({ type: null, text: null });
  const [attachWeather, setAttachWeather] = useState(false);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const { user } = useAuth();
 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 4) {
      setMessage({ type: 'error', text: 'Máximo 4 archivos por post' });
      e.currentTarget.value = '';
      return;
    }
    for (const f of selected) {
      if (f.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: `El archivo ${f.name} debe ser menor a 10MB` });
        e.currentTarget.value = '';
        return;
      }
    }
    const newFiles = [...files, ...selected].slice(0, 4);
    setFiles(newFiles);
    setPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'Debes iniciar sesión' });
      return;
    }
    // Validación: se requiere texto o al menos 1 archivo
    if ((contenido || "").trim().length === 0 && files.length === 0) {
      setMessage({ type: 'error', text: 'La publicación debe tener texto o al menos un archivo adjunto' });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", contenido);
      if (attachWeather && weatherData) formData.append("weather", JSON.stringify(weatherData));
      for (const f of files) formData.append("files", f);
      const res = await api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const json = res.data;
      setContenido("");
      setFiles([]);
      setPreviews([]);
      setMessage({ type: 'success', text: 'Post creado correctamente' });
      if (json?.post) {
        const created: any = json.post;
        created.author = created.author || { id: created.author_id || user?.id };
        created.author.username = created.author.username || user?.username || created.author.username || "";
        created.author.displayname = created.author.displayname || user?.displayname || created.author.displayname || "";
        created.author.profile_picture_url =
          created.author.profile_picture_url ?? user?.profile_picture_url ?? null;
        created.medias = json.medias || [];
        created.weather = json.weather || null;
        onCreated?.(created);
        try {
          window.dispatchEvent(new CustomEvent('post-created', { detail: created }));
        } catch (e) {
          // ignore
        }
      } else {
        onCreated?.();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err?.message || 'Error al crear el post' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!attachWeather) return;
        if (!user?.city) return;
        const w = await fetchWeatherByCity(user.city, (user as any).country_iso);
        if (mounted) setWeatherData(w);
      } catch (e) {
        console.warn('fetch weather for post failed', e);
      }
    })();
    return () => { mounted = false; };
  }, [attachWeather, user?.city, user?.country_iso]);

  const canSubmit = ((contenido || "").trim().length > 0) || files.length > 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2">Crear nuevo post</Typography>
        <Typography variant="body2" color="text.secondary">Comparte lo que estás pensando</Typography>
      </Box>

      <Paper component="form" onSubmit={handleSubmit} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Box>
            <TextField
              label="Contenido & Descripción"
              aria-label="Contenido y descripción"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="¿Qué estás pensando?"
              fullWidth
              multiline
              minRows={4}
              variant="outlined"
            />
          </Box>

          <Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              <Box>
                <input
                  id="upload-file"
                  multiple
                  accept="image/*,video/*,audio/*,.mkv,.webm,.mp4,.ogg,.mp3,.flac,.wav,.aac"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <label htmlFor="upload-file">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<FileUp size={18} />}
                    onClick={() => toast("Adjuntar hasta 4 archivos (imagen, video o audio) — opcional", { icon: '📎', duration: 3500 })}
                    sx={{ textTransform: 'none' }}
                  >
                    Añadir imágenes, videos o audio
                  </Button>
                </label>
              </Box>

              <Box>
                <Tooltip title={attachWeather ? 'Clima activado' : 'Agregar clima'} placement="top">
                  <IconButton
                    onClick={async () => {
                      const newState = !attachWeather;
                      setAttachWeather(newState);
                      if (newState) {
                        if (weatherData) {
                          const temp = Math.round(weatherData.current.temp);
                          const desc = weatherData.current.weather?.[0]?.description || '';
                          toast.success(`Clima agregado: ${temp}° ${desc}`);
                        } else {
                          toast("Obteniendo clima...", { icon: '🌦️' });
                        }
                      } else {
                        toast('Clima desactivado');
                      }
                    }}
                    aria-label="Toggle clima"
                    sx={{ width: 40, height: 40, p: 0.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', color: 'primary.main' }}
                  >
                    <Wind size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {previews.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {previews.map((p, index) => (
                  <Paper key={`${p}-${index}`} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <FileUp size={14} />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{files[index]?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{((files[index]?.size || 0) / 1024).toFixed(1)} KB</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const nf = files.filter((_, i) => i !== index);
                        setFiles(nf);
                        setPreviews(nf.map(f => URL.createObjectURL(f)));
                        toast.success('Archivo eliminado');
                      }}
                      aria-label="Eliminar archivo"
                    >
                      <X size={20} />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>

          

          <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading || !canSubmit}>
              {loading ? (
                <>
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> Publicando...
                </>
              ) : (
                'Publicar'
              )}
            </Button>
            <Button type="button" variant="outlined" color="secondary" fullWidth onClick={() => { setContenido(""); setFiles([]); setPreviews([]); setAttachWeather(false); }}>
              Limpiar
            </Button>
          </Stack>

          {message.text && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color={message.type === 'error' ? 'error' : 'success.main'}>{message.text}</Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {loading && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.4)' }}>
          <Paper sx={{ p: 2 }}>
            <CircularProgress />
          </Paper>
        </Box>
      )}
    </Box>
  );
}
