"use client";
import React, { useState } from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormLabel,
  Stack,
} from "@mui/material";
import ModalBase from "../common/Modal";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const REPORT_REASONS = [
  "Contenido inapropiado",
  "Discurso de odio",
  "Acoso o bullying",
  "Spam",
  "Otro",
];

export default function ReportDialog({
  open,
  onClose,
  onSubmit,
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const handleConfirm = () => {
    const reason =
      selectedReason === "Otro" && customReason ? customReason : selectedReason;
    if (reason.trim()) {
      onSubmit(reason);
      setSelectedReason("");
      setCustomReason("");
    }
    onClose();
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Reportar publicación"
      confirmText="Enviar reporte"
      disableConfirm={
        !selectedReason || (selectedReason === "Otro" && !customReason.trim())
      }
    >
      <Stack spacing={2}>
        <FormLabel component="legend">Motivo del reporte</FormLabel>
        <RadioGroup
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
        >
          {REPORT_REASONS.map((reason) => (
            <FormControlLabel
              key={reason}
              value={reason}
              control={<Radio />}
              label={reason}
            />
          ))}
        </RadioGroup>
        {selectedReason === "Otro" && (
          <TextField
            label="Especifique el motivo"
            fullWidth
            multiline
            rows={3}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        )}
      </Stack>
    </ModalBase>
  );
}
