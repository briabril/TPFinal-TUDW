"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import PostBody from "./PostBody";
import { Reaction } from "./Reaction";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import api from "@tpfinal/api";
import { Post } from "@tpfinal/types";
import AuthorHeader from "./posts/AuthorHeader";
import WeatherBackground from "./common/WeatherBackground";
import { useMemo } from "react";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

type ListaPostsProps = {
  mineOnly?: boolean;
  reloadKey?: number;
  prependPost?: any | null;
};

  const ListaPosts: React.FC<ListaPostsProps> = ({ mineOnly = false, reloadKey, prependPost = null }) => {
  const { user } = require("@/context/AuthContext").useAuth?.() || { user: null };
  const [posts, setPosts] = useState<Post[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const endpoint = mineOnly ? "/posts/mine" : "/posts";
        const { data } = await api.get<ApiResponse<Post[]>>(endpoint);
        let fetched = data.data || [];
        if (prependPost && prependPost.id) {
          const exists = fetched.find((p: any) => p.id === prependPost.id);
          if (!exists) {
            fetched = [prependPost, ...fetched];
          } else {
            fetched = fetched.map((p: any) => (p.id === prependPost.id ? prependPost : p));
          }
        }
        setPosts(fetched);
        setErrorMsg(null);
      } catch (error: any) {
        console.error("Error al obtener posts:", error);
        const message = error.response?.data?.error || error.message || "Error al obtener posts";
        setErrorMsg(message);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [mineOnly, reloadKey]);


  useEffect(() => {
    if (!prependPost || !prependPost.id) return;
    setPosts((current) => {
      const exists = current.find((p) => p.id === prependPost.id);
      if (exists) return current;
      return [prependPost, ...current];
    });
  }, [prependPost]);

  return (
    <Stack spacing={5}>
      {errorMsg && <Typography color="error">{errorMsg}</Typography>}
      {posts.length === 0 && !errorMsg && (
        <Typography color="text.secondary">No hay posts todavía</Typography>
      )}

      {posts.map((post) => {
        const description = post.text ?? "(sin descripción)";
        const created = post.created_at ?? post.created_at ?? "";
  const pAny: any = post as any;
  const weatherMain = pAny?.weather?.current?.weather?.[0]?.main;
  const weatherDesc = pAny?.weather?.current?.weather?.[0]?.description;

        return (
          <Card
            key={post.id}
            variant="outlined"
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: 3,
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
              bgcolor: "transparent",
              position: 'relative',
              maxWidth: 800,
              mx: "auto",
              mt: 4,
            }}
          >
            <CardContent sx={{ px: 0, py: 0, position: 'relative', zIndex: 2 }}>
              <WeatherBackground weather={(post as any).weather} className="post-header-bg" imageOpacity={0.50}>
                <AuthorHeader authorId={post.author.id} weather={(post as any).weather} />
              </WeatherBackground>

              <Box sx={{ px: 2, py: 0 }}>
                <PostBody
                  post={post}
                  description={description}
                  created={created}
                />
              </Box>

              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  pt: 1,
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Reaction userId={user?.id} type="post" targetId={post.id} />

                <Link
                  href={`/posts/${post.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    marginLeft: "auto",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 800, "&:hover": { textDecoration: "underline" } }}
                  >
                    Comentarios
                  </Typography>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};

export default ListaPosts;
