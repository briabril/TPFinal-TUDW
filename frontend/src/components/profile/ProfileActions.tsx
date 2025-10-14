"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { User, BlockStatus, FollowStatus } from "@tpfinal/types";
import { Box, Button, CircularProgress } from "@mui/material";

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
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // --- BLOQUEO ---
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

  // --- SEGUIMIENTO ---
  const handleFollowToggle = async () => {
    setLoadingFollow(true);
    try {
      if (followStatus.isFollowing) {
        // Dejar de seguir
        await api.delete(`/follow/${profile.id}`, { withCredentials: true });
        setFollowStatus({ ...followStatus, isFollowing: false });
      } else {
        // Seguir
        await api.post(`/follow/${profile.id}`, {}, { withCredentials: true });
        setFollowStatus({ ...followStatus, isFollowing: true });
      }
    } catch (err) {
      console.error("Error al seguir/dejar de seguir:", err);
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* Botón de SEGUIR / DEJAR DE SEGUIR */}
      <Button
        variant={followStatus.isFollowing ? "outlined" : "contained"}
        color="primary"
        onClick={handleFollowToggle}
        disabled={loadingFollow || blockStatus.blockedByYou || blockStatus.blockedByThem}
        sx={{
          minWidth: 120,
          fontWeight: 600,
          textTransform: "none",
        }}
        startIcon={
          loadingFollow ? <CircularProgress size={18} color="inherit" /> : null
        }
      >
        {loadingFollow
          ? "Procesando..."
          : blockStatus.blockedByThem
          ? "No disponible"
          : followStatus.isFollowing
          ? "Siguiendo"
          : "Seguir"}
      </Button>

      {/* Botón de BLOQUEAR / DESBLOQUEAR */}
      <Button
        variant="contained"
        color={blockStatus.blockedByYou ? "inherit" : "error"}
        onClick={handleBlockToggle}
        disabled={loadingBlock}
        sx={{
          minWidth: 120,
          fontWeight: 600,
          textTransform: "none",
          bgcolor: blockStatus.blockedByYou ? "grey.300" : "error.main",
          "&:hover": {
            bgcolor: blockStatus.blockedByYou ? "grey.400" : "error.dark",
          },
        }}
        startIcon={
          loadingBlock ? <CircularProgress size={18} color="inherit" /> : null
        }
      >
        {loadingBlock
          ? "Procesando..."
          : blockStatus.blockedByYou
          ? "Desbloquear"
          : "Bloquear"}
      </Button>
    </Box>
  );
}
