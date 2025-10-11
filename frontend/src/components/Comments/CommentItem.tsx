
"use client"
import {Comment}  from "../../types/comment";
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
    <Box className="ml-0 md:ml-0">
      <Box className="border border-gray-200 rounded-xl p-3 mb-2 bg-white shadow-sm hover:shadow-md transition-shadow  duration-200 hover:bg-gray-50">
     
        <Box className="flex items-center mt-2 gap-2">
             <Typography variant="subtitle2" className="font-bold text-gray-800">
          {comment.author_username || "Usuario anónimo"}
        </Typography>
          <Typography variant="body2" className="mt-1 text-gray-700">{comment.text}</Typography>
      
        </Box>
        <Box className="flex items-center">
         <Reaction userId={comment.author_id} targetId={comment.id} type="comment" />
        
          <Typography variant="caption" className="text-gray-500 text-xs"> {formatDate(comment.created_at)}</Typography>
            
        </Box>
     
        <CommentForm postId={comment.post_id} parentId={comment.id} onSubmit={handleReply} />
      </Box>

      {/* Comentarios hijos */}
      <Box className="pl-4 border-l-2 border-gray-100">
        {comment.children?.map((child) => (
          <CommentItem key={child.id} comment={child} onReply={onReply} />
        ))}
      </Box>
    </Box>
)
}
export default CommentItem