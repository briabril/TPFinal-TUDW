"use client";
import { Comment } from "../../types/comment";
import socket from "@/socket";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { Typography, Box, CircularProgress, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import { CommentFormData } from "@/schemas/commentSchema";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface CommentProps {
  postId: string | number;
  authorId: string;
}

const Comments: React.FC<CommentProps> = ({ postId, authorId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Comment[]>(`/comments/post/${postId}`);
      setComments(data);
    } catch (error) {
      toast.error("Error al cargar comentarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    const eventName = `new-comment-${postId}`;
    const handleNewComment = (newComment: Comment) => {
      setComments((prev) => [...prev, newComment]);
    };

    socket.on(eventName, handleNewComment);

    return () => {
      socket.off(eventName, handleNewComment);
    };
  }, [postId]);

  const handleSubmit = async (data: CommentFormData, parentId?: string | number | null) => {
    try {
      await api.post(
        "/comments",
        {
          author_id: authorId,
          post_id: postId,
          text: data.text,
          parent_id: parentId || null,
        },
        { withCredentials: true }
      );
    } catch (error) {
      toast.error("Error al publicar comentario");
    }
  };

  return (
    <Box
      sx={{
        mt: 4,
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "transparent",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 2,
          color: "text.primary",
        }}
      >
        Comentarios
      </Typography>

      <Box sx={{ mb: 3 }}>
        <CommentForm postId={postId} onSubmit={handleSubmit} />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No hay comentarios todavía. ¡Sé el primero en comentar!
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {comments.map((c, index) => (
            <Box key={c.id}>
              <CommentItem comment={c} onReply={handleSubmit} />
              {index !== comments.length - 1 && (
                <Divider sx={{ my: 1, opacity: 0.5 }} />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Comments;
