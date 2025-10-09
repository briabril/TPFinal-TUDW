"use client";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Heart } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface PostReactionProps {
  userId: string;
  postId: string;
}

interface ToggleReactionResponse {
  liked: boolean;
}

interface LikesCountResponse {
  likes: number;
}

export const PostReaction = ({ userId, postId }: PostReactionProps) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);

  const toggleReaction = async () => {
    try {
      const result = await api.post<ToggleReactionResponse>("/api/reactions", {
        user_id: userId,
        post_id: postId,
      });

      setLiked(result.data.liked);
      fetchCount(); // actualiza el contador
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al dar like");
    }
  };

  const fetchCount = async () => {
    try {
      const result = await api.get<LikesCountResponse>(
        `/api/reactions/post/${postId}/likes`
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
