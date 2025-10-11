
"use client"
import {Comment}  from "../../types/comment";
import { Typography, Box , Paper} from "@mui/material";
import CommentForm from "./CommentForm";
import { CommentFormData } from "@/schemas/commentSchema";
import { Reaction } from "../Reaction";
import { useAuth } from "@/context/AuthContext";

interface CommentItemProps{
    comment: Comment;
    onReply: (data: CommentFormData, parentId?: string | number | null) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({comment, onReply})=>{
  const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // diferencia en segundos

  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString(); // si pasó más de un día, mostrar fecha
};
    const handleReply = (data: CommentFormData) =>{
        onReply(data, comment.id)
    }
    const { user } = useAuth();
return(
    <Box>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {comment.author_username || "Usuario anónimo"}
          </Typography>
          <Typography variant="body2">{comment.text}</Typography>

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
      <Box sx={{ pl: 3, borderLeft: `2px solid ` }}>
        {comment.children?.map((child) => (
          <CommentItem key={child.id} comment={child} onReply={onReply} />
        ))}
      </Box>
    </Box>
)
}
export default CommentItem