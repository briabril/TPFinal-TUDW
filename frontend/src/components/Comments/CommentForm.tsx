import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, CommentFormData } from "@tpfinal/schemas";
import { TextField, Button, Avatar, Paper, CircularProgress, Box, Stack } from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
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
    formState: { errors, isSubmitting },
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
const {user} = useAuth();
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        p: 1.5,
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <Avatar
          src={user?.profile_picture_url || "../../default-avatar-icon.jpg"}
          sx={{ width: 36, height: 36 }}
        />

        <Box flex={1}>
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Escribe un comentario..."
                multiline
                fullWidth
                size="small"
                variant="outlined"
                error={!!errors.text}
                helperText={errors.text?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontSize: "0.9rem",
                  },
                }}
              />
            )}
          />

          <Stack direction="row" justifyContent="flex-end" mt={1}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={isSubmitting}
              sx={{
                borderRadius: 20,
                textTransform: "none",
                px: 2.5,
                py: 0.5,
                fontWeight: 600,
              }}
            >
              {isSubmitting ? <CircularProgress size={16} /> : "Publicar"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default CommentForm;
