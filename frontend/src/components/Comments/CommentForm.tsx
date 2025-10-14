import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, CommentFormData } from "@tpfinal/schemas";
import { TextField, Button, Avatar, Paper, CircularProgress, Box } from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  postId: string | number;
  parentId?: string | number | null;
  onSubmit: (data: CommentFormData, parentId?: string | number | null) => void;
  avatarUrl?: string;
}
const CommentForm: React.FC<Props> = ({ onSubmit, parentId }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({ resolver: zodResolver(commentSchema) });
   const handleFormSubmit = async (data: CommentFormData) => {
  try {
    await onSubmit(data, parentId); // espera a que el comentario se cree
    reset({ text: "" }) // limpia el form
    toast.success("Comentario publicado ✅");
  } catch (error) {
    toast.error("Error al publicar comentario");
  }
};

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} className="border border-gray-200 rounded-lg p-3 mb-2">
      <Controller
        name="text"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            placeholder="Escribe un comentario..."
            multiline
            rows={2}
            fullWidth
            variant="outlined"
            size="small"
            error={!!errors.text}
            helperText={errors.text?.message}
          />
        )}
      />

      
        <Box className="flex justify-end">
          <Button
            type="submit"
            className="bg-blue-500 text-white rounded-full px-4 py-1 hover:bg-blue-600 transition-colors"
          >
            Publicar
          </Button>
        </Box>
    
    </Box>
  );

}
export default CommentForm;
