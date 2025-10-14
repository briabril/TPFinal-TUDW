"use client";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Heart } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface PostReactionProps {
  userId?: string ;
  targetId: string; 
  type: "post" | "comment"; 
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
    
        const endpoint = type === "post" ? (`/reactions/post/${targetId}`) : (`/reactions/comment/${targetId}`)
    
      const result = await api.post<ToggleReactionResponse>(endpoint, {},{ withCredentials: true });

      setLiked(result.data.liked);
      fetchCount(); // actualiza el contador
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al dar like");
    }
  };

  const fetchCount = async () => {
    try {
      const endpoint = type === "post" ? (`/reactions/post/${targetId}/likes`) :  (`/reactions/comment/${targetId}/likes`)
      const result = await api.get<LikesCountResponse>(
        endpoint
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
    <Button onClick={toggleReaction} className="flex items-center">
      {liked ? <Heart className="text-red-500 size-5" fill="red" /> : <Heart className="text-gray-600 size-6"/>}
      {count > 0 && <span className="text-gray-600 ml-1 text-s">{count}</span>}
    </Button>
  );
};
