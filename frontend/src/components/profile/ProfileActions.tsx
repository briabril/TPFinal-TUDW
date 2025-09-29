"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { User } from "@tpfinal/types";
import { Box, Button, CircularProgress } from "@mui/material";

interface BlockStatus {
  blockedByYou: boolean;
  blockedByThem: boolean;
}

interface Props {
  profile: User;
  blockStatus: BlockStatus;
  setBlockStatus: (status: BlockStatus) => void;
}

export default function ProfileActions({
  profile,
  blockStatus,
  setBlockStatus,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleBlockToggle = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* Botón de seguir (lógica futura) */}
      <Button
        variant="contained"
        color="primary"
        sx={{ minWidth: 120, fontWeight: 600, textTransform: "none" }}
      >
        Seguir
      </Button>

      {/* Botón de bloquear/desbloquear */}
      <Button
        variant="contained"
        color={blockStatus.blockedByYou ? "inherit" : "error"}
        onClick={handleBlockToggle}
        disabled={loading}
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
          loading ? <CircularProgress size={18} color="inherit" /> : null
        }
      >
        {loading
          ? "Procesando..."
          : blockStatus.blockedByYou
          ? "Desbloquear"
          : "Bloquear"}
      </Button>
    </Box>
  );
}
