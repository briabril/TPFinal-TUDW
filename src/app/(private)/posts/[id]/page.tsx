"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../../api/index";
import {
  Card,
  CardContent,
  CircularProgress,
  Box,
} from "@mui/material";
import Comments from "@/components/Comments/Comments";
import AuthorHeader from "@/components/posts/AuthorHeader";
import PostBody from "@/components/posts/PostBody";
import PostActions from "@/components/posts/PostActions";
import { useAuth } from "@/context/AuthContext";
import { Post } from "../../../../types";

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

  const { user } = useAuth();
  const isOwn = Boolean(user && String(post.author.id) === String(user.id));

  const handleDelete = async () => {
    if (!confirm("¿Eliminar post?")) return;
    try {
      await (await import("@/services/postService")).deletePost(post.id);
      window.location.href = "/feed";
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (reason: string) => {
    try {
      await (await import("@/services/postService")).reportPost(post.id, reason);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <CardContent>
        <AuthorHeader
          author={post.author}
          actions={
            <PostActions
              onEdit={() => {}}
              onDelete={handleDelete}
              onReport={handleReport}
              loading={false}
              isOwn={isOwn}
            />
          }
          postId={post.id}
        />
        <PostBody post={post} description={post.text ?? ""} />
        <Comments postId={post.id} authorId={post.author.id} />
      </CardContent>
    </Card>
  );
};

export default PostDetail;
