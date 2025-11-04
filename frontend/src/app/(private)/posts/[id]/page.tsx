"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@tpfinal/api";
import {
  Card,
  CardContent,
  CircularProgress,
  Box,
} from "@mui/material";
import Comments from "@/components/Comments/Comments";
import AuthorHeader from "@/components/posts/AuthorHeader";
import PostBody from "@/components/posts/PostBody";
import { Post } from "@tpfinal/types";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get<{ data: Post }>(`/posts/${id}`);
        setPost(response.data.data);
      } catch (error) {
        console.error("Error al obtener el post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  if (loading || !post || !post.author) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <CardContent>
        <AuthorHeader authorId={post.author.id} />
        <PostBody post={post} description={post.text} />
        <Comments postId={post.id} authorId={post.author.id} />
      </CardContent>
    </Card>
  );
};

export default PostDetail;
