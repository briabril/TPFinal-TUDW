"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Box, Button, Card, CardContent, TextField, Typography, Avatar, CircularProgress, FormControlLabel, Switch } from "@mui/material";
import { fetchWeatherByCity } from "@/services/weatherService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://api.bloop.cool";

type CrearPostProps = {
  onCreated?: (createdPost?: any) => void;
};

export default function CrearPost({ onCreated }: CrearPostProps = {}) {
  const [contenido, setContenido] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string | null }>({ type: null, text: null });

  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    // max 4 files
    if (selected.length + files.length > 4) {
      setMessage({ type: 'error', text: 'Máximo 4 archivos por post' });
      e.currentTarget.value = '';
      return;
    }
    // per-file 10MB limit
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

    setLoading(true);
    try {

  const formData = new FormData();
  formData.append("text", contenido);
  if (attachWeather && weatherData) {
    formData.append("weather", JSON.stringify(weatherData));
  }
  for (const f of files) formData.append("files", f);

  console.log("Creating post...", { text: contenido, fileCount: files.length });
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      console.log("create post response", res.status, json);
      if (!res.ok) {
        const errMsg = json?.error || json?.message || "Error creando post";
        setMessage({ type: 'error', text: errMsg });
        return;
      }

      setContenido("");
      setFiles([]);
      setPreviews([]);
      setMessage({ type: 'success', text: 'Post creado correctamente' });
      
      if (json?.post) {
        const created: any = json.post;
        created.author = created.author || { id: created.author_id || user?.id };
        created.medias = json.medias || [];
        created.weather = json.weather || null;
        onCreated?.(created);
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

  const [attachWeather, setAttachWeather] = useState(false);
  const [weatherData, setWeatherData] = useState<any | null>(null);

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

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Crear nuevo post
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
        

          <TextField
            label="Contenido / Descripción"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            sx={{ mb: 2 }}
            size="small"
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <input multiple accept="image/*,video/*,audio/*,.mkv,.webm,.mp4,.ogg,.mp3,.flac,.wav,.aac" id="upload-file" type="file" style={{ display: "none" }} onChange={handleFileChange} />
            <label htmlFor="upload-file">
              <Button variant="outlined" component="span">
                Adjuntar
              </Button>
            </label>

            {previews.length > 0 ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {previews.map((p, idx) => {
                  const f = files[idx];
                  return (
                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {f.type.startsWith('video') ? (
                        <video src={p} width={120} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} controls />
                      ) : f.type.startsWith('audio') ? (
                        <audio src={p} controls />
                      ) : (
                        <Avatar variant="rounded" src={p} alt={`preview-${idx}`} sx={{ width: 72, height: 72 }} />
                      )}
                      <Button size="small" onClick={() => {
                        const nf = files.filter((_, i) => i !== idx);
                        setFiles(nf);
                        setPreviews(nf.map(f => URL.createObjectURL(f)));
                      }}>Quitar</Button>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography color="text.secondary">Adjuntar hasta 4 archivos (imagen, video o audio) (opcional)</Typography>
            )}
          </Box>

          {/* Adjuntar clima */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={attachWeather}
                  onChange={(e) => setAttachWeather(e.target.checked)}
                  color="primary"
                />
              }
              label="Adjuntar clima actual"
            />
            {attachWeather && weatherData && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography fontWeight={700}>{Math.round(weatherData.current.temp)}°</Typography>
                <Typography variant="caption" color="text.secondary">{weatherData.current.weather?.[0]?.description}</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Publicar"}
            </Button>
            <Button variant="outlined" onClick={() => { setContenido(""); setFiles([]); setPreviews([]); }}>
              Limpiar
            </Button>
          </Box>
          {message.text && (
            <Box mt={2}>
              <Typography color={message.type === 'error' ? 'error' : 'success.main'}>{message.text}</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Card>
  );
}
