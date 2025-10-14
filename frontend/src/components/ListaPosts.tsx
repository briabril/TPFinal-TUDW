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

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

const ListaPosts: React.FC<{ mineOnly?: boolean }> = ({ mineOnly = false }) => {
  const { user } = require("@/context/AuthContext").useAuth?.() || { user: null };
  const [posts, setPosts] = useState<Post[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const endpoint = mineOnly ? "/posts/mine" : "/posts";
        const { data } = await api.get<ApiResponse<Post[]>>(endpoint);
        console.log(data.data)
        setPosts(data.data || []);
        setErrorMsg(null);
      } catch (error: any) {
        console.error("Error al obtener posts:", error);
        const message = error.response?.data?.error || error.message || "Error al obtener posts";
        setErrorMsg(message);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [mineOnly]);

  return (
    <Stack spacing={5}>
      {errorMsg && <Typography color="error">{errorMsg}</Typography>}
      {posts.length === 0 && !errorMsg && (
        <Typography color="text.secondary">No hay posts todavía</Typography>
      )}

      {posts.map((post) => {
        const description = post.text ?? "(sin descripción)";
        const created = post.created_at ?? post.created_at ?? "";

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
              bgcolor: "background.paper",
              maxWidth: 800, 
              mx: "auto", 
              mt: 4,
            }}
          >
            <CardContent sx={{ px: 0, py: 0 }}>
              <AuthorHeader authorId={post.author.id} />
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
