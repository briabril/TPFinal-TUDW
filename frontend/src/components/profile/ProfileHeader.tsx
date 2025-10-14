"use client";

import { User, BlockStatus, FollowStatus } from "@tpfinal/types";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ProfileActions from "./ProfileActions";

// ✅ Definimos la interfaz Props con los tipos correctos importados del archivo types
interface Props {
  profile: User;
  isOwnProfile: boolean;
  blockStatus: BlockStatus;
  setBlockStatus: (status: BlockStatus) => void;
  followStatus: FollowStatus;
  setFollowStatus: (status: FollowStatus) => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  blockStatus,
  setBlockStatus,
  followStatus,
  setFollowStatus,
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        alignItems={{ xs: "center", sm: "flex-start" }}
      >
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
        <Box sx={{ flex: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            flexWrap="wrap"
          >
            <Typography variant="h5" fontWeight={600}>
              {profile.username}
            </Typography>

            {!isOwnProfile && (
              <ProfileActions
                profile={profile}
                blockStatus={blockStatus}
                setBlockStatus={setBlockStatus}
                followStatus={followStatus}
                setFollowStatus={setFollowStatus}
              />
            )}
          </Stack>

          {profile.displayname && (
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              {profile.displayname}
            </Typography>
          )}

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
          {isOwnProfile && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              {profile.email}
            </Typography>
          )}

          {/* Métricas del perfil */}
          <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{profile.posts_count ?? 0}</strong> publicaciones
            </Typography>
            <Typography variant="body2">
              <strong>{profile.followers_count ?? 0}</strong> seguidores
            </Typography>
            <Typography variant="body2">
              <strong>{profile.following_count ?? 0}</strong> seguidos
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
