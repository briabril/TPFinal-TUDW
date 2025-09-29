"use client";

import { Alert, AlertTitle, Button } from "@mui/material";
import { User } from "@tpfinal/types";

interface BlockStatus {
  blockedByYou: boolean;
  blockedByThem: boolean;
}

interface Props {
  blockStatus: BlockStatus;
  profile: User;
  onUnblock: () => Promise<void>;
}

export default function BlockStatusMessage({ blockStatus, profile, onUnblock }: Props) {
  if (blockStatus.blockedByYou && blockStatus.blockedByThem) {
    return (
      <Alert severity="info">
        <AlertTitle>Bloqueo mutuo</AlertTitle>
        Tú y <strong>{profile.username}</strong> se tienen bloqueados.
      </Alert>
    );
  }

  if (blockStatus.blockedByYou) {
    return (
      <Alert
        severity="info"
      >
        <AlertTitle>Usuario bloqueado</AlertTitle>
        Has bloqueado a <strong>{profile.username}</strong>.
      </Alert>
    );
  }

  if (blockStatus.blockedByThem) {
    return (
      <Alert severity="warning">
        <AlertTitle>Acceso restringido</AlertTitle>
        <strong>{profile.username}</strong> te ha bloqueado 
        No podrás ver su información ni interactuar con este usuario
      </Alert>
    );
  }

  return null;
}
