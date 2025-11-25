"use client";

import { User, BlockStatus, FollowStatus } from "../../types/user";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { Button } from "@mui/material";
import ProfileActions from "./ProfileActions";
import { alpha } from "@mui/material/styles";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../api/index";
interface Props {
  profile: User;
  isOwnProfile: boolean;
  blockStatus: BlockStatus;
  setBlockStatus: (status: BlockStatus) => void;
  followStatus: FollowStatus;
  setFollowStatus: (status: FollowStatus) => void;
  onFollowChange?: () => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  blockStatus,
  setBlockStatus,
  followStatus,
  setFollowStatus,
}: Props) {

  const [flag, setFlag] = useState<string | null>(null);

    useEffect(() => {
    async function fetchFlag() {
      if (!profile.country_iso) return;
      try {
        const res = await api.get(`/countries/${profile.country_iso}/flag`);
        setFlag(res.data.flag);
      } catch (err) {
        console.error("Error al traer la bandera:", err);
      }
    }
    fetchFlag();
  }, [profile.country_iso]);
  return (
    <Box sx={{ width: "100%", mb: 6 }}>
      <Box
        sx={{
          height: 150,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(
              theme.palette.primary.dark,
              0.8
            )})`,
          borderRadius: "0 0 24px 24px",
          position: "relative",
        }}
      >
        <Avatar
          src={profile.profile_picture_url || undefined}
          alt={profile.username}
          sx={{
            width: 150,
            height: 150,
            border: "4px solid white",
            position: "absolute",
            left: "50%",
            bottom: -75,
            transform: "translateX(-50%)",
            bgcolor: "grey.200",
            fontSize: 48,
            boxShadow: 3,
          }}
        />
      </Box>

      <Box
        sx={{
          mt: 10,
          textAlign: "center",
          maxWidth: 900,
          mx: "auto",
          px: 2,
        }}
      >
        <Stack direction="column" alignItems="center" spacing={1}>
          <Typography variant="h5" component="h1" fontWeight={700}>
            {profile.username}
          </Typography>

          {profile.displayname && (
            <Typography variant="subtitle1" component="h2" color="text.secondary">
              {profile.displayname}
            </Typography>
          )}

          <Typography
            variant="body1"
            sx={{
              mt: 0.5,
              color: profile.bio ? "text.primary" : "text.disabled",
              fontStyle: profile.bio ? "normal" : "italic",
            }}
          >
            {profile.bio || "Este usuario no tiene biografía"}
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
{profile.country_iso ? (
  <Typography variant="body2" color="text.secondary" display="flex" sx={{ mt: 0.5, justifyContent: "center", alignItems: "center"}}>
    {profile.country_iso && (
      <>
       {flag ? (
  flag.startsWith("http") ? (
    <img src={flag} alt={profile.country_iso} style={{ width: 18, marginLeft: 6 }} />
  ) : (
    <span style={{ marginLeft: 6 }}>{flag}</span>
  )
) : (
  <strong>{profile.country_iso}</strong>
)}

      </>
    )}
  </Typography>
) : null}
          <Stack
            direction="row"
            justifyContent="center"
            spacing={5}
            sx={{ mt: 2, "& strong": { fontWeight: 600 } }}
          >
            <Typography variant="body2">
              <strong>{profile.posts_count ?? 0}</strong>
              <br />
              publicaciones
            </Typography>
            <Typography variant="body2">
              <strong>{profile.followers_count ?? 0}</strong>
              <br />
              seguidores
            </Typography>
            <Typography variant="body2">
              <strong>{profile.following_count ?? 0}</strong>
              <br />
              seguidos
            </Typography>
          </Stack>
  {isOwnProfile && (
  <Button
    variant="outlined"
    component={Link}
    href={`/${profile.username}/edit`}
    sx={(theme) => ({
      color: theme.palette.mode === 'dark' ? 'common.white' : undefined,
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : undefined,
    })}
  >
    Editar Perfil
  </Button>
)}


        </Stack>

        <Divider sx={{ mt: 5 }} />
      </Box>
    </Box>
  );
}
