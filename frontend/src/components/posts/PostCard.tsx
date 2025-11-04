"use client";
import React from "react";
import { Card, CardContent, Box } from "@mui/material";
import AuthorHeader from "./AuthorHeader";
import PostBody from "./PostBody";
import PostActions from "./PostActions";
import SharedPost from "./SharedPost";
import { Post } from "@tpfinal/types";
import { useAuth } from "@/context/AuthContext";

export default function PostCard({ post }: { post: Post }) {
  console.log(post)
  const { user } = useAuth();
  const description = post.text ?? "(sin descripción)";
  const created = post.created_at ?? "";

  const isShared = !!post.shared_post;
  const [editRequested, setEditRequested] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const isOwn = Boolean(user && String(post.author.id) === String(user.id));

  const handleDelete = async () => {
    if (!confirm("¿Eliminar post?")) return;
    setLoading(true);
    try {
      const res = await (await import("@/services/postService")).deletePost(post.id);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleReport = async (reason: string) => {
    setLoading(true);
    try {
      await (await import("@/services/postService")).reportPost(post.id, reason);
      // optional: show toast
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = () => setEditRequested(true);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: 3,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
        bgcolor: "background.paper",
        maxWidth: 800,
        mx: "auto",
      }}
    >
      <CardContent sx={{ px: 0, py: 0 }}>
        {/* 🔹 Si es un post compartido → mostrar SharedPost */}
        {isShared ? (
          <SharedPost post={post} />
        ) : (
          <>
            <AuthorHeader
              author={post.author}
              actions={
                <PostActions
                  onEdit={handleEditRequest}
                  onDelete={handleDelete}
                  onReport={handleReport}
                  loading={loading}
                  isOwn={isOwn}
                />
              }
            />
            <Box sx={{ px: 2 }}>
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
      </CardContent>
    </Card>
  );
}
