"use client";

import React from "react";
import { Stack, Typography, Box, Skeleton, Fade } from "@mui/material";
import PostCard from "./PostCard";
import { usePosts } from "@/hooks/usePosts";

interface PostListProps {
  mode: string;
  username?: string;
  visibility?: string
}

const PostList =({ mode, username , visibility}: PostListProps) => {
  const { posts, error, loading } = usePosts(mode, username, visibility);
console.log("posts", posts)
  if (loading) {
    return (
      <Stack spacing={4} sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ p: 2, borderRadius: 3 }}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
          </Box>
        ))}
      </Stack>
    );
  }
  if (error) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 10,
          opacity: 0.8
        }}
      >
        <Typography variant="h6" color="error" fontWeight={600}>
          Ocurrió un error al cargar los posts
        </Typography>
        <Typography variant="body2">{error}</Typography>
      </Box>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Fade in timeout={400}>
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            opacity: 0.7,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            No hay posts todavía
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cuando se publiquen, aparecerán aquí.
          </Typography>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in timeout={300}>
      <Stack sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} visibility={post.visibility} />
        ))}
      </Stack>
    </Fade>
  );
}
export default React.memo(PostList);