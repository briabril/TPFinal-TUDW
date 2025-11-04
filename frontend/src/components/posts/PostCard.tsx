"use client";
import { Card, CardContent, Box } from "@mui/material";
import AuthorHeader from "./AuthorHeader";
import PostBody from "./PostBody";
import SharedPost from "./SharedPost";
import { Post } from "@tpfinal/types";
import { useAuth } from "@/context/AuthContext";

export default function PostCard({ post }: { post: Post }) {
  console.log(post)
  const { user } = useAuth();
  const description = post.text ?? "(sin descripción)";
  const created = post.created_at ?? "";

  const isShared = !!post.shared_post;

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
            <AuthorHeader author={post.author} />
            <Box sx={{ px: 2 }}>
              <PostBody post={post} description={description} />
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
