"use client";
import { Comment } from "@tpfinal/types";
import { Typography, Box, Paper, Button, TextField } from "@mui/material";
import CommentForm from "./CommentForm";
import { CommentFormData } from "@tpfinal/schemas/commentSchema";
import { Reaction } from "../Reaction";
import { useAuth } from "@/context/AuthContext";
import api from "@tpfinal/api";
import toast from "react-hot-toast";
import { useState } from "react";

interface CommentItemProps {
  comment: Comment;
  onReply: (data: CommentFormData, parentId?: string | number | null) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // diferencia en segundos

    if (diff < 60) return "ahora";
    if (diff < 3600) {
      const m = Math.floor(diff / 60);
      return `${m} min${m > 1 ? "s" : ""}`;
    }
    if (diff < 86400) {
      const h = Math.floor(diff / 3600);
      return `${h} h${h > 1 ? "s" : ""}`;
    }
    const d = Math.floor(diff / 86400);
    if (d < 7) return `${d} día${d > 1 ? "s" : ""}`;
    return date.toLocaleDateString();
  };

  const handleEditSubmit = async (comment: Comment) => {
    try {
      if (!editedText.trim()) {
        toast.error("El comentario no puede estar vacío");
        return;
      }
      await api.put(`/comments/${comment.id}`, { text: editedText });
       comment.text = editedText;
        setIsEditing(false);
    } catch (error: any) {
      toast.error("Error al editar el comentario");
      console.error("No se pudo editar el comentario:", error);
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (!confirm("¿Seguro que querés eliminar este comentario?")) return;

    try {
      await api.delete(`/comments/${comment.id}`, { withCredentials: true });
    } catch (error: any) {
      toast.error("Error al eliminar el comentario");
      console.error("No se pudo eliminar el comentario:", error);
    }
  };

  const handleReply = (data: CommentFormData) => {
    onReply(data, comment.id);
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {comment.author_username || "Usuario anónimo"}
          </Typography>

             {/* Texto del comentario o campo de edición */}
          {isEditing ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <TextField
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                multiline
                fullWidth
                size="small"
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleEditSubmit(comment)} 
                >
                  Guardar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(comment.text);
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2">{comment.text}</Typography>
          )}

          {user?.id === comment.author_id && (
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#1976d2",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
                onClick={() =>  setIsEditing(true)}
              >
                Editar
              </Button>
              <Button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
                onClick={() => handleDelete(comment)}
              >
                Eliminar
              </Button>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
            <Reaction userId={comment.author_id} targetId={comment.id} type="comment" />
            <Typography variant="caption" color="text.secondary">
              {formatDate(comment.created_at)}
            </Typography>
          </Box>

          <CommentForm postId={comment.post_id} parentId={comment.id} onSubmit={handleReply} />
        </Box>
      </Paper>

      {/* Comentarios hijos */}
      <Box sx={{ pl: 3, borderLeft: `2px solid` }}>
        {comment.children?.map((child) => (
          <CommentItem key={child.id} comment={child} onReply={onReply} />
        ))}
      </Box>
    </Box>
  );
};

export default CommentItem;
