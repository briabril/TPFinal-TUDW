"use client";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
import AuthorHeader from "./AuthorHeader";
import PostBody from "./PostBody";
import { Reaction } from "../Reaction";
import Link from "next/link";
import { Post } from "@tpfinal/types";
import { useAuth } from "@/context/AuthContext";

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const description = post.text ?? "(sin descripción)";
  const created = post.created_at ?? "";

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
        <AuthorHeader authorId={post.author.id} />
        <Box sx={{ px: 2 }}>
          <PostBody post={post} description={description} />
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ p: 1.5 }}
        >
          <Reaction userId={user?.id} type="post" targetId={post.id} />
          <Link
            href={`/posts/${post.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              marginLeft: "auto",
            }}
          >
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 800, "&:hover": { textDecoration: "underline" } }}
            >
              Comentarios
            </Typography>
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}
