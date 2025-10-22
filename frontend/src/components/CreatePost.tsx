"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Box, Button, Card, CardContent, TextField, Typography, Avatar, CircularProgress } from "@mui/material";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function CrearPost() {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
  for (const f of files) formData.append("files", f);

      console.log("Creating post...", { text: contenido, file });
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
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err?.message || 'Error al crear el post' });
    } finally {
      setLoading(false);
    }
  };

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

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Publicar"}
            </Button>
            <Button variant="outlined" onClick={() => { setTitulo(""); setContenido(""); setFiles([]); setPreviews([]); }}>
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
