"use client";

import React, { useEffect, useState } from "react";
import PostBody from "./PostBody";
import {Reaction} from "./Reaction"
import Comments from "./Comments/Comments";
import { Card, CardContent, CardMedia, Typography, Stack, Box } from "@mui/material";
type RawPost = Record<string, any>;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const getMediaUrl = (media: any) => {
  if (!media) return null;
  const url = media.url || media.media_url || null;
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
};

const ListaPosts: React.FC<{ mineOnly?: boolean }> = ({ mineOnly = false }) => {
  const { user } = require("@/context/AuthContext").useAuth?.() || { user: null };
  const [posts, setPosts] = useState<RawPost[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = mineOnly ? `${API_BASE}/api/posts/mine` : `${API_BASE}/api/posts`;
        const opts: any = {};
        if (mineOnly) opts.credentials = "include";
        const res = await fetch(url, opts);
        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json?.error || "Error al cargar posts");
          setPosts([]);
          return;
        }
        const raw: any[] = json.data || [];
        const byId = new Map<string, any>();
        for (const p of raw) {
          const id = p.id || p.post_id || null;
          if (!id) continue;
          const existing = byId.get(id);
          const medias = p.medias ?? (p.media ? [p.media] : []);
          if (!existing) {
            byId.set(id, { ...p, medias: Array.isArray(medias) ? medias.slice() : [] });
          } else {

            const existingMedias = Array.isArray(existing.medias) ? existing.medias : [];
            const toAdd = Array.isArray(medias) ? medias : [];
            for (const m of toAdd) {
              const url = m?.url || m?.media_url;
              if (!existingMedias.find((em: any) => (em.url || em.media_url) === url)) {
                existingMedias.push(m);
              }
            }
            existing.medias = existingMedias;
            byId.set(id, existing);
          }
        }
        setPosts(Array.from(byId.values()));
        setErrorMsg(null);
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.message || "Error al obtener posts");
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  return (
    <>
      <Stack spacing={3}>
         <Typography variant="h5" fontWeight="bold">Posts publicados</Typography>
        {errorMsg &&  <Typography color="error">{errorMsg}</Typography>}
        {posts.length === 0 && !errorMsg && <Typography>No hay posts todavía</Typography>}

        {posts.map((post: any) => {
          const description = post.text ?? "(sin descripción)";
          const created = post.created_at ?? post.createdAt ?? post.publishedAt ?? "";
          const medias = post.medias ?? (post.media ? [post.media] : []);
          const mediaUrl = medias.length > 0 ? getMediaUrl(medias[0]) : null;
          const mediaType = medias.length > 0 ? (medias[0]?.type ?? medias[0]?.media_type ?? null) : null;
          const author = post.author?.displayname ?? post.author?.username ?? "(autor desconocido)";
          const isOwn = user && post.author?.username === user.username;

          return (
            <Card 
              key={post.id ?? Math.random()}
             variant="outlined" sx={{ bgcolor: isOwn ? "blue.50" : "background.paper" }}
            >
              <CardContent>
                <PostBody
                  post={post}
                  description={description}
                  created={created}
                  author={author}
                  isOwn={isOwn}
                />
                 <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <Reaction userId={user?.id} type="post" targetId={post.id}/>
                  </Stack>
                <Comments postId={post.id} authorId={user?.id}/>
              </CardContent>

              {medias && medias.length > 0 && (
                <Box sx={{ display: "flex", overflowX: "auto", p: 1 }}>
                    {medias.map((m: any, idx: number) => {
                      const url = getMediaUrl(m);
                      const type = (m.type ?? m.media_type)?.toUpperCase?.() || null;
                      if (!url) return null;
                      return (
                      <Box key={idx} sx={{ minWidth: 200, mr: 1, borderRadius: 1, overflow: "hidden" }}>
                      {type === 'AUDIO' ? (
                        <audio src={url} controls style={{ width: "100%" }} />
                      ) : type === 'VIDEO' ? (
                        <video src={url} controls style={{ width: "100%", borderRadius: 8 }} />
                      ) : type === 'IMAGE' || type === 'GIF' ? (
                        <CardMedia
                          component="img"
                          image={url}
                          alt={description ?? 'media'}
                          sx={{ borderRadius: 1 }}
                        />
                      ) : null}
                  </Box>
                  );
                })}
              </Box>
            )}
          </Card>
          );
        })}
      </Stack>

  
    </>
  );
};

export default ListaPosts;
