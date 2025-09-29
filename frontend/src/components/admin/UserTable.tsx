"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import type { User } from "@tpfinal/types";

interface Props {
  users: User[];
  onToggle: (id: string) => Promise<void>;
}

export default function UserTable({ users, onToggle }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setLoadingId(id);
    try {
      await onToggle(id);
    } catch (err) {
      console.error("Error toggling user:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "grey.100" }}>
            <TableCell align="center">
              <strong>Usuario</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Email</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Estado</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Acción</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u, index) => (
            <TableRow
              key={u.id}
              sx={{
                backgroundColor: index % 2 === 0 ? "grey.50" : "white",
              }}
            >
              <TableCell align="center">{u.username}</TableCell>
              <TableCell align="center">{u.email}</TableCell>
              <TableCell align="center">
                <Chip
                  label={u.status === "ACTIVE" ? "Activo" : "Suspendido"}
                  color={u.status === "ACTIVE" ? "success" : "error"}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="center">
                <Button
                  variant="contained"
                  color={u.status === "ACTIVE" ? "error" : "success"}
                  size="small"
                  disabled={loadingId === u.id}
                  onClick={() => handleToggle(u.id)}
                  startIcon={
                    loadingId === u.id ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : undefined
                  }
                >
                  {loadingId === u.id
                    ? "Procesando..."
                    : u.status === "ACTIVE"
                    ? "Suspender"
                    : "Activar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
