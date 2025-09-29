"use client";
import { TextField } from "@mui/material";
import { FieldError, UseFormRegister } from "react-hook-form";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
}

export default function FormInput({
  label,
  name,
  type = "text",
  error,
  register,
}: FormInputProps) {
  return (
    <TextField
      label={label}
      type={type}
      {...register(name)}
      error={!!error}
      helperText={error?.message}
      fullWidth
      variant="outlined"
      size="medium"
      margin="dense"
      sx={{
        "& .MuiInputBase-root": {
          borderRadius: "12px",
        },
        "& .MuiFormLabel-root": {
          fontSize: "0.9rem",
          fontWeight: 500,
          color: "text.secondary",
        },
        "& .MuiInputBase-input": {
          fontSize: "1rem",
        },
      }}
    />
  );
}
