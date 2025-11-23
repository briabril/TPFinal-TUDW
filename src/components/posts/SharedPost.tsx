"use client";

import { Box, Typography, Stack, IconButton, Tooltip } from "@mui/material";
import { Repeat } from "@mui/icons-material";
import AuthorHeader from "./AuthorHeader";
import PostBody from "./PostBody";
import PostActions from "./PostActions";
import { useState } from "react";

export default function SharedPost({ post }: any) {
  const sharedBy = post.author; // Usuario que compartió
  const originalPost = post.shared_post; // Post original
  const originalAuthor = originalPost?.author;
  const [hasShared, setHasShared] = useState(true); // Simula que ya fue compartido

  if (!originalPost || !originalAuthor) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: 1,
        mb: 2,
      }}
    >
      {/* 🔹 Header: autor que compartió */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          Compartido por {sharedBy.displayname || sharedBy.username}
        </Typography>
        <Tooltip title="Reposteo">
          <Repeat fontSize="small" color="action" />
        </Tooltip>
      </Stack>
      <Box
        sx={{
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 2,
          p: 2,
          backgroundColor: "rgba(0,0,0,0.02)",
        }}
      >
        <AuthorHeader
          author={originalAuthor}
          actions={
            <PostActions
              onEdit={() => {}}
              onDelete={() => {}}
              onReport={async (reason: string) => {
                await (await import("@/services/postService")).reportPost(originalPost.id, reason);
              }}
              loading={false}
                isOwn={false}
                postId={originalPost.id}
            />
          }
        />
        <PostBody post={originalPost} description={originalPost.text} />
      </Box>
    </Box>
  );
}
