"use client";
import { Comment } from "@tpfinal/types";
import socket from "@/socket";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { Typography, Box, CircularProgress, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import { CommentFormData } from "@tpfinal/schemas";
import api from "@tpfinal/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface CommentProps {
  postId: string | number;
  authorId: string;
}

const Comments: React.FC<CommentProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
const {user} = useAuth();
const authorId = user?.id
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
// Agregar un comentario (nuevo o respuesta)
function addCommentToTree(tree: Comment[], newComment: Comment): Comment[] {
  if (!newComment.parent_id) {
    // comentario raíz
    return [...tree, { ...newComment, children: [] }];
  }

  const addRecursively = (nodes: Comment[]): Comment[] =>
    nodes.map((node) => {
      if (node.id === newComment.parent_id) {
        return {
          ...node,
          children: [...(node.children || []), { ...newComment, children: [] }],
        };
      }
      if ((node.children?.length || 0) > 0) {
        return { ...node, children: addRecursively(node.children || []) };
      }
      return node;
    });

  return addRecursively(tree);
}

// Actualizar un comentario existente
function updateCommentInTree(tree: Comment[], updatedComment: Comment): Comment[] {
  const updateRecursively = (nodes: Comment[]): Comment[] =>
    nodes.map((node) => {
      if (node.id === updatedComment.id) {
        return { ...node, text: updatedComment.text };
      }
      if ((node.children?.length ||0)> 0) {
        return { ...node, children: updateRecursively(node.children || []) };
      }
      return node;
    });

  return updateRecursively(tree);
}

// Eliminar un comentario (y todos sus hijos)
function deleteCommentFromTree(tree: Comment[], commentId: string | number): Comment[] {
  const deleteRecursively = (nodes: Comment[]): Comment[] =>
    nodes
      .filter((node) => node.id !== commentId)
      .map((node) => ({
        ...node,
        children: deleteRecursively(node.children || []),
      }));

  return deleteRecursively(tree);
}

useEffect(() => {
  fetchComments();

  const newEvent = `new-comment-${postId}`;
  const updateEvent = `update-comment-${postId}`;
  const deleteEvent = `delete-comment-${postId}`;

  const handleNewComment = (newComment: Comment) => {
    setComments((prev) => addCommentToTree(prev, newComment));
  };

  const handleUpdateComment = (updated: Comment) => {
    setComments((prev) => updateCommentInTree(prev, updated));
  };

  const handleDeleteComment = (deletedId: string | number) => {
    setComments((prev) => deleteCommentFromTree(prev, deletedId));
  };

  socket.on(newEvent, handleNewComment);
  socket.on(updateEvent, handleUpdateComment);
  socket.on(deleteEvent, handleDeleteComment);

  return () => {
    socket.off(newEvent, handleNewComment);
    socket.off(updateEvent, handleUpdateComment);
    socket.off(deleteEvent, handleDeleteComment);
  };
}, [postId]);



  const handleSubmit = async (data: CommentFormData, parentId?: string | number | null) => {
    try{
        const res = await api.post("/comments", {
            author_id: authorId,
            post_id: postId,
            text: data.text,
            parent_id : parentId || null
        },
    {withCredentials: true})
    return res.data;
    }catch(error){
        toast.error("Error al publicar comentario")
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
              <CommentItem comment={c} onReply={handleSubmit} onEdit={(updated) => setComments((prev) => updateCommentInTree(prev, updated))}
  onDelete={(id) => setComments((prev) => deleteCommentFromTree(prev, id))}/>
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