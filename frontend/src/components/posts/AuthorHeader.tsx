"use client";

import { Avatar, Box, Typography, Stack } from "@mui/material";
import { Author } from "@tpfinal/types";

interface AuthorHeaderProps {
  author: Author; // autor original
  sharedBy?: Author | null; // usuario que compartió, si aplica
  actions?: React.ReactNode;
}

export default function AuthorHeader(props: AuthorHeaderProps) {
  const { author, sharedBy, actions } = props;
  if (!author) return null;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2.5}
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 3,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        position: "relative", 
        pr: 6,
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
          transition: "background-color 0.3s ease",
        },
      }}
    >
      {/* Avatar del autor original */}
      <Avatar
        src={author.profile_picture_url || "/default-avatar.png"}
        alt={author.displayname || author.username}
        sx={{
          width: 56,
          height: 56,
          border: "2px solid rgba(0,0,0,0.1)",
          boxShadow: 1,
        }}
      />

      <Box>
        {/* Nombre principal: autor original */}
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ lineHeight: 1.2, color: "text.primary" }}
        >
          {author.displayname || author.username}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.3, fontStyle: "italic" }}
        >
          @{author.username}
        </Typography>

        {/* Si el post fue compartido */}
        {sharedBy && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Compartido por{" "}
            <strong>
              {sharedBy.displayname || sharedBy.username}
            </strong>
          </Typography>
        )}
      </Box>
      <Box sx={{ position: "absolute", top: 12, right: 12 }}>{actions}</Box>
    </Stack>
  );
}
