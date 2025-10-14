"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { User, BlockStatus, FollowStatus } from "@tpfinal/types";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles"; // ✅ Import necesario
import { PersonAdd, PersonRemove, Block, LockOpen } from "@mui/icons-material";

interface Props {
  profile: User;
  blockStatus: BlockStatus;
  setBlockStatus: (status: BlockStatus) => void;
  followStatus: FollowStatus;
  setFollowStatus: (status: FollowStatus) => void;
}

export default function ProfileActions({
  profile,
  blockStatus,
  setBlockStatus,
  followStatus,
  setFollowStatus,
}: Props) {
  const theme = useTheme();
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const handleBlockToggle = async () => {
    setLoadingBlock(true);
    try {
      if (blockStatus.blockedByYou) {
        await api.delete(`/blocks/${profile.id}`, { withCredentials: true });
        setBlockStatus({ ...blockStatus, blockedByYou: false });
      } else {
        const confirmBlock = window.confirm(
          `¿Estás seguro de que deseas bloquear a @${profile.username}?`
        );
        if (confirmBlock) {
          await api.post(`/blocks/${profile.id}`, {}, { withCredentials: true });
          setBlockStatus({ ...blockStatus, blockedByYou: true });
        }
      }
    } catch (err) {
      console.error("Error bloqueando:", err);
    } finally {
      setLoadingBlock(false);
    }
  };

  const handleFollowToggle = async () => {
    setLoadingFollow(true);
    try {
      if (followStatus.isFollowing) {
        await api.delete(`/follow/${profile.id}`);
        setFollowStatus({ ...followStatus, isFollowing: false });
      } else {
        await api.post(`/follow/${profile.id}`);
        setFollowStatus({ ...followStatus, isFollowing: true });
      }
    } catch (err) {
      console.error("Error al seguir/dejar de seguir:", err);
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      justifyContent={{ xs: "center", sm: "flex-start" }}
      sx={{
        mt: 2,
        flexWrap: "wrap",
        "& button": {
          borderRadius: "20px",
          minWidth: 130,
          fontWeight: 600,
          textTransform: "none",
          height: 38,
          transition: "all 0.25s ease",
        },
      }}
    >
      <Button
        variant={followStatus.isFollowing ? "outlined" : "contained"}
        color="primary"
        onClick={handleFollowToggle}
        disabled={
          loadingFollow || blockStatus.blockedByYou || blockStatus.blockedByThem
        }
        startIcon={
          loadingFollow ? (
            <CircularProgress size={18} color="inherit" />
          ) : followStatus.isFollowing ? (
            <PersonRemove fontSize="small" />
          ) : (
            <PersonAdd fontSize="small" />
          )
        }
        sx={{
          borderColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: followStatus.isFollowing
              ? alpha(theme.palette.primary.main, 0.1)
              : theme.palette.primary.dark,
          },
        }}
      >
        {loadingFollow
          ? "Procesando..."
          : blockStatus.blockedByThem
          ? "No disponible"
          : followStatus.isFollowing
          ? "Siguiendo"
          : "Seguir"}
      </Button>

      <Button
        variant="outlined"
        color={blockStatus.blockedByYou ? "inherit" : "error"}
        onClick={handleBlockToggle}
        disabled={loadingBlock}
        startIcon={
          loadingBlock ? (
            <CircularProgress size={18} color="inherit" />
          ) : blockStatus.blockedByYou ? (
            <LockOpen fontSize="small" />
          ) : (
            <Block fontSize="small" />
          )
        }
        sx={{
          bgcolor: blockStatus.blockedByYou
            ? "grey.100"
            : alpha(theme.palette.error.main, 0.1),
          borderColor: theme.palette.error.main,
          color: blockStatus.blockedByYou
            ? "text.secondary"
            : theme.palette.error.main,
          "&:hover": {
            bgcolor: blockStatus.blockedByYou
              ? "grey.200"
              : alpha(theme.palette.error.main, 0.2),
          },
        }}
      >
        {loadingBlock
          ? "Procesando..."
          : blockStatus.blockedByYou
          ? "Desbloquear"
          : "Bloquear"}
      </Button>
    </Stack>
  );
}
