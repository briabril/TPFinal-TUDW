"use client";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Heart } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface PostReactionProps {
  userId?: string ;
  targetId: string; // puede ser post_id o comment_id
  type: "post" | "comment"; // para saber qué endpoint usar
}

interface ToggleReactionResponse {
  liked: boolean;
}

interface LikesCountResponse {
  likes: number;
}

export const Reaction = ({ userId, targetId, type }: PostReactionProps) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);

  const toggleReaction = async () => {
    try {
    
        const endpoint = type === "post" ? ("/api/reactions") : ("/api/reactions/comments")
        const payload = type === "post" ? {user_id: userId, post_id: targetId} : {user_id: userId, comment_id : targetId}
    
      const result = await api.post<ToggleReactionResponse>(endpoint, payload);

      setLiked(result.data.liked);
      fetchCount(); // actualiza el contador
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al dar like");
    }
  };

  const fetchCount = async () => {
    try {
      const endopoint = type === "post" ? (`/api/reactions/post/${targetId}/likes`) :  (`/api/reactions/comment/${targetId}/likes`)
      const result = await api.get<LikesCountResponse>(
        endopoint
      );
      setCount(result.data.likes);
    } catch {
      toast.error("Error al obtener los likes");
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <Button onClick={toggleReaction}>
      {liked ? <Heart color="red" fill="red" /> : <Heart />}
      {count > 0 && <span style={{ marginLeft: 5 }}>{count}</span>}
    </Button>
  );
};
