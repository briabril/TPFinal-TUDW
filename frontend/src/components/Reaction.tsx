"use client";
import { useState, useEffect } from "react";
import { IconButton, Typography, Stack, Button } from "@mui/material";
import { Heart } from "lucide-react";
import api from "@tpfinal/api";
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
  const fetchUserLiked = async () => {
  try {
    const endpoint =
      type === "post"
        ? `/reactions/post/${targetId}/isLiked`
        : `/reactions/comment/${targetId}/isLiked`;

    const result = await api.get<ToggleReactionResponse>(endpoint, {
      withCredentials: true,
    });

    setLiked(result.data.liked);
  } catch {
    setLiked(false);
  }
};

  useEffect(() => {
    fetchUserLiked();
    fetchCount();
  }, []);

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <IconButton
        onClick={toggleReaction}
        sx={{
          p: 0.6,
          color: liked ? "error.main" : "text.secondary",
          "&:hover": { color: liked ? "error.main" : "#f40000" },
          transition: "color 0.2s ease",
        }}
      >
        <Heart size={18} fill={liked ? "red" : "none"} />
      </IconButton>
      {count > 0 && (
        <Typography variant="body2" color="text.secondary">
          {count}
        </Typography>
      )}
    </Stack>
  );
};
