"use client";
import { useState, useEffect } from "react";
import { Button, IconButton, Tooltip, Stack, Typography } from "@mui/material";
import { Heart, MessageCircle, Bookmark, ShareIcon, Repeat2} from "lucide-react";
import api from "../api/index";
import toast from "react-hot-toast";

interface PostReactionProps {
  commentCounter?: number,
  userId?: string;
  targetId: string;
  type: "post" | "comment";
}

interface ToggleReactionResponse {
  liked: boolean;
}

interface LikesCountResponse {
  likes: number;
}

interface ShareStatusResponse {
  shared: boolean;
}

export const Reaction = ({
  commentCounter,
  userId,
  targetId,
  type
}: PostReactionProps) => {
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleReaction = async () => {
    try {
      const endpoint =
        type === "post"
          ? `/reactions/post/${targetId}`
          : `/reactions/comment/${targetId}`;

      const result = await api.post<ToggleReactionResponse>(
        endpoint,
        {},
        { withCredentials: true }
      );

      setLiked(result.data.liked);
      fetchCount();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al dar like");
    }
  };

  const fetchCount = async () => {
    try {
      const endpoint =
        type === "post"
          ? `/reactions/post/${targetId}/likes`
          : `/reactions/comment/${targetId}/likes`;
      const result = await api.get<LikesCountResponse>(endpoint);
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

  const fetchUserShared = async () => {
    try {
      const result = await api.get<ShareStatusResponse>(
        `/posts/${targetId}/isShared`,
        { withCredentials: true }
      );
      setShared(result.data.shared);
    } catch {
      setShared(false);
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      await api.post(`/posts/${targetId}/share`, {}, { withCredentials: true });
      toast.success("Post compartido correctamente");
      setShared(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al compartir el post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLiked();
    fetchCount();
    if (type === "post") fetchUserShared();
  }, []);

  return (
    <Stack direction="row" spacing={3} alignItems="center">

      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton onClick={toggleReaction} size="small">
          <Heart
            size={20}
            className={liked ? "text-red-500" : "text-gray-500"}
            fill={liked ? "red" : "none"}
          />
        </IconButton>
        {count > 0 && (
          <Typography variant="body2" color="text.secondary">
            {count}
          </Typography>
        )}
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.5}>
        <MessageCircle size={20} className="text-gray-500" />
        {type === "post" && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ cursor: "pointer" }}
          >
            {commentCounter}
          </Typography>
        )}
      </Stack>

      <IconButton onClick={handleShare} size="small" disabled={shared}>
      <Repeat2 
              className={shared ? "text-blue-600" : "text-gray-600"}
              fill={shared ? "blue" : "none"}
            />
          </IconButton>

    </Stack>
     
  );
};
