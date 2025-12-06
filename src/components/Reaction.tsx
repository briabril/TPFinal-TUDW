"use client";
import { useState, useEffect } from "react";
import {
  Button,
  IconButton,
  Stack,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import { AlignJustify, Heart, Repeat2 } from "lucide-react";
import api from "../api/index";
import toast from "react-hot-toast";
import { User } from "@/types";
import ModalBase from "./common/Modal";
import { useRouter } from "next/navigation";

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
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showLikes, setShowLikes] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
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
  useEffect(() => {
    const fetchLikesUsers = async () => {
      try {
        const users = await api.get(`/reactions/post/${targetId}/users`, {
          withCredentials: true,
        });
        setUsers(users.data);
      } catch (error) {
        console.error("Error al traer los usuarios que dieron like", error);
        toast.error("Error al traer los usuarios que dieron like");
      }
    };
    fetchLikesUsers();
  }, [showLikes]);

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
      toast.error(
        error.response?.data?.message || "Error al compartir el post"
      );
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
      <Stack direction="row" alignItems="center">
        <Box sx={{ width: 35 }} display="flex" alignItems="center">
          <IconButton
            onClick={toggleReaction}
            size="small"
            aria-label="Poner me gusta al post"
            title="Poner me gusta al post"
          >
            <Heart
              size={20}
              className={liked ? "text-red-500" : "text-gray-500"}
              fill={liked ? "red" : "none"}
            />
          </IconButton>
          {count > 0 && (
            <IconButton
              title="Ver likes del post"
              size="small"
              onClick={() => setShowLikes(true)}
              aria-label="Ver likes del post"
              sx={{
                cursor: "pointer",
                padding: "2px",
                minWidth: 0,
                width: "20px",
                height: "20px",
                transition: "0.2s",
                "&:hover": {
                  color: "primary.main",
                  textDecoration: "underline",
                },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 5 }}
              >
                {count}
              </Typography>
            </IconButton>
          )}
        </Box>
        {count > 0 && (
          <>
            <ModalBase
              title="Likes del post"
              open={showLikes}
              onClose={() => setShowLikes(false)}
              cancelText="Cerrar"
            >
              <Stack direction="column" spacing={2} sx={{ mt: 1 }}>
                {users.map((u) => (
                  <Stack
                    key={u.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      width: "100%",
                      p: 2,
                      borderRadius: "12px",
                      backgroundColor: "background.paper",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                      },
                    }}
                    onClick={() => router.push(`/${u.username}`)}
                  >
                    <Avatar
                      src={u.profile_picture_url || "/default-avatar-icon.png"}
                      sx={{ width: 48, height: 48 }}
                    />

                    <Stack direction="column" spacing={0.2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {u.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {u.displayname}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </ModalBase>
          </>
        )}
      </Stack>

      {type === "post" && (
        <IconButton
          onClick={handleShare}
          size="small"
          disabled={shared}
          aria-label="Compartir post"
          title="Compartir post"
        >
          <Repeat2
            className={shared ? "text-blue-600" : "text-gray-600"}
            fill={shared ? "blue" : "none"}
          />
        </IconButton>
      )}
    </Stack>
  );
};
