"use client";

import React, { useEffect, useState } from "react";
import PostBody from "./PostBody";

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
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Posts publicados</h2>
        {errorMsg && <div className="text-red-600 mb-3">{errorMsg}</div>}
        {posts.length === 0 && !errorMsg && <p>No hay posts todavía</p>}

        {posts.map((post: any) => {
          const description = post.text ?? "(sin descripción)";
          const created = post.created_at ?? post.createdAt ?? post.publishedAt ?? "";
          const medias = post.medias ?? (post.media ? [post.media] : []);
          const mediaUrl = medias.length > 0 ? getMediaUrl(medias[0]) : null;
          const mediaType = medias.length > 0 ? (medias[0]?.type ?? medias[0]?.media_type ?? null) : null;
          const author = post.author?.displayname ?? post.author?.username ?? "(autor desconocido)";
          const isOwn = user && post.author?.username === user.username;

          return (
            <article
              key={post.id ?? Math.random()}
              className={`${
                isOwn ? "bg-blue-50" : "bg-white"
              } rounded-lg p-4 shadow-sm`}
            >
              <div className="mb-3">
                <PostBody
                  post={post}
                  description={description}
                  created={created}
                  author={author}
                  isOwn={isOwn}
                />
              </div>

              {medias && medias.length > 0 && (
                <div className="w-full">
                  <div className="flex gap-2 overflow-x-auto max-w-full py-1">
                    {medias.map((m: any, idx: number) => {
                      const url = getMediaUrl(m);
                      const type = (m.type ?? m.media_type)?.toUpperCase?.() || null;
                      if (!url) return null;
                      return (
                        <div key={idx} className="flex-shrink-0 w-48 overflow-hidden rounded-lg">
                          {type === 'AUDIO' ? (
                            <div className="p-3 bg-gray-50 rounded flex items-center">
                              <audio src={url} controls className="w-full h-auto" />
                            </div>
                          ) : type === 'VIDEO' ? (
                            <video src={url} controls className="w-full h-auto object-cover rounded-lg" />
                          ) : type === 'IMAGE' || type === 'GIF' ? (
                            <img src={url} alt={description ?? 'media'} className="w-full h-auto object-cover rounded-lg" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

  
    </>
  );
};

export default ListaPosts;
