"use client";
import { useState, useEffect } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import { Heart, ShareIcon } from "lucide-react";
import api from "../api/index";
import toast from "react-hot-toast";

interface PostReactionProps {
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

export const Reaction = ({ userId, targetId, type }: PostReactionProps) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // 🔹 Like (toggle)
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

  // 🔹 Obtener cantidad de likes
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

  // 🔹 Saber si el usuario ya dio like
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

  // 🔹 Saber si el usuario ya compartió el post
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

  // 🔹 Compartir post
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
    <>
      {/* ❤️ Botón de like */}
      <Button onClick={toggleReaction} className="flex items-center" aria-label="Reaccionar" title="Reaccionar">
        {liked ? (
          <Heart className="text-red-500 size-5" fill="red" />
        ) : (
          <Heart className="text-gray-600 size-6" />
        )}
        {count > 0 && (
          <span className="text-gray-600 ml-1 text-s">{count}</span>
        )}
      </Button>

      <Tooltip
        title={
          shared
            ? "Compartiste este post"
            : "Compartir este post"
        }
      >
        <span>
          <IconButton
            onClick={handleShare}
            disabled={loading || shared}
            color={shared ? "primary" : "default"} aria-label="Compartir post" title="Compartir post"
          >
            <ShareIcon
              className={shared ? "text-blue-600" : "text-gray-600"}
              fill={shared ? "blue" : "none"}
            />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};
