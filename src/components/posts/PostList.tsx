"use client";
import React from "react";
import { Stack, Typography } from "@mui/material";
import { usePosts } from "@/hooks/usePosts";
import PostCard from "./PostCard";

interface PostListProps {
  initialMode: string;
   username?: string;
}

export default function PostList({ initialMode,  username  }: PostListProps) {
  const { posts, error, loading } = usePosts(initialMode);
  if (loading) return <Typography>Cargando posts...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (posts.length === 0) return <Typography>No hay posts todavía</Typography>;

  return (
    <Stack spacing={5}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Stack>
  );
}
