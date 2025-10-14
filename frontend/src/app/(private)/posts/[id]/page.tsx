"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import Comments from "@/components/Comments/Comments";
import AuthorHeader from "@/components/posts/AuthorHeader";
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
    <Card sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <CardContent>
        {/* Información del autor */}
        <AuthorHeader authorId={post.author.id} />

        {/* Imagen del post (si existe) */}
        {post.medias?.length > 0 && (
          <Box
            component="img"
            src={post.medias[0].url}
            alt="Imagen del post"
            sx={{
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
              borderRadius: 2,
              my: 2,
            }}
          />
        )}
        <Typography variant="h5" gutterBottom>
          {post.text}
        </Typography>
        <Comments postId={post.id} authorId={post.author.id} />
      </CardContent>
    </Card>
  );
};

export default PostDetail;
