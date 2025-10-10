
"use client"
import { Comment } from "@/types/Comment";
import { Typography, Box } from "@mui/material";
import CommentForm from "./CommentForm";
import { CommentFormData } from "@/schemas/commentSchema";
import { Reaction } from "../Reaction";
import { useAuth } from "@/context/AuthContext";

interface CommentItemProps{
    comment: Comment;
    onReply: (data: CommentFormData, parentId?: string | number | null) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({comment, onReply})=>{
    const handleReply = (data: CommentFormData) =>{
        onReply(data, comment.id)
    }
    const { user } = useAuth();
return(
    <Box className="border-l-2 border-gray-300 pl-4 mt-2">
      <Reaction userId={user?.id} targetId={comment.id}  type="comment"/>
      <Typography variant="subtitle2" className="font-bold">
        Usuario {comment.author_id}
      </Typography>
      <Typography variant="body2">{comment.text}</Typography>

      {/* Formulario para responder */}
      <CommentForm postId={comment.post_id} parentId={comment.id} onSubmit={onReply} />

      {/* Comentarios hijos */}
      {comment.children?.map((child) => (
        <CommentItem key={child.id} comment={child} onReply={onReply} />
      ))}
    </Box>
)
}
export default CommentItem