"use client";

import { User } from "@tpfinal/types";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import ProfileActions from "./ProfileActions";

interface BlockStatus {
  blockedByYou: boolean;
  blockedByThem: boolean;
}

interface Props {
  profile: User;
  isOwnProfile: boolean;
  blockStatus: BlockStatus;
  setBlockStatus: (status: BlockStatus) => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  blockStatus,
  setBlockStatus,
}: Props) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        py: 4,
        px: 2,
      }}
    >
      <Grid container spacing={4} alignItems="center">
        {/* Avatar */}
        <Grid item>
          <Avatar
            src={profile.profile_picture_url || undefined}
            alt={profile.username}
            sx={{
              width: 150,
              height: 150,
              bgcolor: "grey.200",
              fontSize: 48,
            }}
          />
        </Grid>

        {/* Info principal */}
        <Grid item xs>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              {profile.username}
            </Typography>

            {!isOwnProfile && (
              <ProfileActions
                profile={profile}
                blockStatus={blockStatus}
                setBlockStatus={setBlockStatus}
              />
            )}
          </Box>

          {profile.displayname && (
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              {profile.displayname}
            </Typography>
          )}

          {/* Bio */}
          {profile.bio ? (
            <Typography variant="body1" sx={{ mt: 1 }}>
              {profile.bio}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{ mt: 1, fontStyle: "italic", color: "text.disabled" }}
            >
              Este usuario no tiene biografía
            </Typography>
          )}

          {/* Email solo si es propio */}
          {isOwnProfile && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              {profile.email}
            </Typography>
          )}

          {/* Métricas (a futuro, sin lógica aún) */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              mt: 2,
            }}
          >
            <Typography variant="body2">
              <strong>
                {profile.posts_count ?? 0}</strong> publicaciones
            </Typography>
            <Typography variant="body2">
              <strong>{profile.followers_count ?? 0}</strong> seguidores
            </Typography>
            <Typography variant="body2">
              <strong>{profile.following_count ?? 0}</strong> seguidos
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
