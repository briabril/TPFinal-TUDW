"use client";
import { Comment } from "@tpfinal/types";
import { Typography, Box, Paper, Button, TextField, Avatar, Stack, IconButton, useTheme, Collapse } from "@mui/material";
import CommentForm from "./CommentForm";
import { MessageCircle, Edit2, Trash2, Icon } from "lucide-react";
import { CommentFormData } from "@tpfinal/schemas/commentSchema";
import { Reaction } from "../Reaction";
import { useAuth } from "@/context/AuthContext";
import api from "@tpfinal/api";
import toast from "react-hot-toast";
import { useState } from "react";

interface CommentItemProps {
  comment: Comment;
  onReply: (data: CommentFormData, parentId?: string | number | null) => void;
    onEdit?: (updated: Comment) => void;
  onDelete?: (commentId: string | number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false)
  const theme = useTheme();

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

  const handleEditSubmit = async () => {
    try {
      if (!editedText.trim()) {
        toast.error("El comentario no puede estar vacío");
        return;
      }
   const { data: updated } = await api.put(`/comments/${comment.id}`, {
      text: editedText,
    });

    onEdit?.(updated);
        setIsEditing(false);
          toast.success("Comentario actualizado ✏️");
    } catch (error: any) {
      toast.error("Error al editar el comentario");
      console.error("No se pudo editar el comentario:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que querés eliminar este comentario?")) return;

    try {
      await api.delete(`/comments/${comment.id}`, { withCredentials: true });
      onDelete?.(comment.id);
     toast.success("Comentario eliminado 🗑️");
    } catch (error: any) {
      toast.error("Error al eliminar el comentario");
      console.error("No se pudo eliminar el comentario:", error);
    }
  };

  const handleReply = (data: CommentFormData) => {
    onReply(data, comment.id);
     setShowReply(false);
  };

  return (
    <Box sx={{mt: 1}}>
      <Paper elevation={0} sx={{ p: 2, display: "flex" , gap:2, borderBottom: `1px solid  ${theme.palette.divider}`}}>
       
        <Avatar alt={comment.author_username || "usuario"}
          src={comment.author_avatar || "../../default-avatar-icon.jpg"}
          sx={{width: 30, height: 30}}/>
        <Box sx={{ flexGrow: 1, pl:1}}>
         <Stack direction="row" alignItems="center" spacing={1}>
             <Typography variant="subtitle2" fontWeight="bold">
            {comment.author_username || "Usuario"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(comment.created_at)}
          </Typography>
         </Stack>
         

             {/* Texto del comentario o campo de edición */}
          {isEditing ? (
            <Box sx={{mt:1 }}>
              <TextField
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                multiline
                fullWidth
                size="small"
              />
              <Stack direction="row" spacing={1} mt={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleEditSubmit} 
                >
                  Guardar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(comment.text);
                  }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography variant="body2">{comment.text}</Typography>
          )}
          <Stack direction="row" alignItems="center" spacing={1} mt={1}>
            <Reaction userId={comment.author_id} targetId={comment.id} type="comment" />
            <IconButton size="small" onClick={()=> setShowReply((prev)=> !prev)} sx={{color: "text.secondary", "&:hover":{color:"#00d600"}}}><MessageCircle size={16}/></IconButton>
        
            {user?.id === comment.author_id && (
              <>
                <IconButton
                size="small"
                  onClick={() =>  setIsEditing(true)}
                  sx={{color: "text.secondary", "&:hover":{color:"#1966ff"}}}
                  
                >
                 <Edit2 size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{color: "text.secondary" , "&:hover":{color:"#e00000"}}}
                  onClick={ handleDelete}
                >
                <Trash2 size={16}/>
                </IconButton>
              </>
            )}
          </Stack>
          {showReply && (
            <Box sx={{mt:1}}>
              <CommentForm
              postId={comment.post_id}
              parentId={comment.id}
              onSubmit={handleReply}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Comentarios hijos */}
     {(comment.children?.length ?? 0) > 0 && (
  <Box sx={{ mt: 1, pl: 4, borderLeft: `2px solid ${theme.palette.divider}` ,  backgroundColor: theme.palette.action.hover,}}>
    
      <Button
        size="small"
        sx={{
          textTransform: "none",
          fontSize: "0.8rem",
          color: "text.secondary",
          "&:hover": { textDecoration: "underline" },
        }}
        onClick={() => setShowReplies((prev)=> !prev)}
      >
        {showReplies ? "Ocultar repuestas" :`Ver respuestas (${comment.children?.length})` } 
      </Button>
   

    <Collapse in={showReplies} timeout={300} unmountOnExit sx={{ mt: 1 }}>
      {comment.children?.map((child) => (
        <CommentItem key={child.id} comment={child} onReply={onReply} />
      ))}
 
    </Collapse>
  </Box>
)}
   </Box>
  );
};

export default CommentItem;
