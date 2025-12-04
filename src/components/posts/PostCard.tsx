"use client";

import React, { useEffect } from "react";
import { Box, Divider } from "@mui/material";
import AuthorHeader from "./AuthorHeader";
import PostBody from "./PostBody";
import PostActions from "./PostActions";
import SharedPost from "./SharedPost";
import { Post } from "../../types/post";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import WeatherBackground from "../common/WeatherBackground";
import { useSocket } from "@/hooks/useSocket";

interface PostCardProps {
  post: Post;
  visibility?: string
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const description = post.text ?? "(sin descripción)";
  const { socket, ready } = useSocket();
  const isShared = Boolean(post.shared_post);

  const [editRequested, setEditRequested] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    if (!ready || !socket.current) return;

    console.log("Uniéndose al room del post:", post.id);
    socket.current.emit("join_post", post.id);

    return () => {
      console.log("Saliendo del room del post:", post.id);
      socket.current?.emit("leave_post", post.id);
    };
  }, [ready, socket, post.id]);

  const isOwn = Boolean(user && String(post.author.id) === String(user.id));

  console.log("user.id:", user?.id);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await (await import("@/services/postService")).deletePost(post.id);
      window.dispatchEvent(
        new CustomEvent("post-deleted", { detail: post.id })
      );
      toast.success("Post eliminado");
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (reason: string) => {
    setLoading(true);
    try {
      await (await import("@/services/postService")).reportPost(
        post.id,
        reason
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = () => {
    setEditRequested(true);
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
        mb: 4,
        cursor: "pointer",
        position: "relative",
        boxShadow:
          "-6px 0 18px rgba(0,0,0,0.06), 6px 0 18px rgba(0,0,0,0.06)",

        transition: "transform 0.2s ease, box-shadow 0.2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            "-10px 0 22px rgba(0,0,0,0.10), 10px 0 22px rgba(0,0,0,0.10)",
        },

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "6px",
          height: "100%",
          background: "transparent",
          transition: "background 0.25s ease",
        },
        "&:hover::before": {
          background: "primary.main",
        },
      }}
    >
      {isShared ? (
        <SharedPost post={post} />
      ) : (
        <>
          <WeatherBackground
            weather={(post as any).weather}
            postId={post.id}
            imageOpacity={0.45}
          >
            <Box sx={{ px: 2, pt: 2 }}>
              <AuthorHeader
                author={post.author}
                sharedBy={post.shared_post?.author ?? null}
                createdAt={post.created_at}
                visibility={post.visibility}
                actions={
                  <PostActions
                    onEdit={handleEditRequest}
                    onDelete={handleDelete}
                    onReport={handleReport}
                    loading={loading}
                    isOwn={isOwn}
                    postId={post.id}
                  />
                }
                weather={(post as any).weather}
                postId={post.id}
              />
            </Box>
          </WeatherBackground>

          <Box sx={{ px: 2, pt: 1 }}>
            <PostBody
              post={post}
              description={description}
              isOwn={isOwn}
              onDelete={handleDelete}
              onReport={handleReport}
              editRequested={editRequested}
              clearEditRequested={() => setEditRequested(false)}
              user={user}
            />
          </Box>
        </>
      )}

      <Divider
        sx={{
          borderColor: "rgba(0,0,0,0.06)",
          opacity: 0.5,
          width: "92%",
          mx: "auto",
        }}
      />
    </Box>
  );
}
