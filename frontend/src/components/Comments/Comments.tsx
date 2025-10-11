"use client"
import { Comment } from "../../types/comment";
import socket from "@/socket";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { CommentFormData } from "@/schemas/commentSchema";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface CommentProps {
    postId: string | number;
    authorId: string;
}
const Comments: React.FC<CommentProps> = ({postId, authorId}) =>{
      const [comments, setComments] = useState<Comment[]>([]);

    const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try{
        const {data} = await api.get<Comment[]>(`/comments/post/${postId}`);
    setComments(data);}
    catch (error){
        toast.error("Error al cargar comentarios")
    }finally{
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
    try{
        await api.post(
            "/comments", {
            author_id: authorId,
            post_id: postId,
            text: data.text,
            parent_id : parentId || null
        },
    {withCredentials: true})
    }catch(error){
        toast.error("Error al publicar comentario")
    }
       
  };

  return (
    <Box className="mt-4">
      <Typography variant="h6" className="mb-2">Comentarios</Typography>
      <CommentForm postId={postId} onSubmit={handleSubmit} />
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        comments.map((c) => <CommentItem key={c.id} comment={c} onReply={handleSubmit} />)
      )}
    </Box>
  );
};
export default Comments;