import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, CommentFormData } from "../../schemas/commentSchema";
import {
  TextField,
  Button,
  Avatar,
  Paper,
  CircularProgress,
  Box,
  Stack,
  IconButton,
  Popover,
} from "@mui/material";
import getImageUrl from "@/utils/getImageUrl";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useState } from "react";
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
      reset({ text: "" }); // limpia el form
      toast.success("Comentario publicado ✅");
    } catch (error) {
      toast.error("Error al publicar comentario");
    }
  };
  const { user } = useAuth();
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
          src={
            getImageUrl(user?.profile_picture_url) ??
            "../../default-avatar-icon.jpg"
          }
          sx={{ width: 36, height: 36 }}
        />

        <Box flex={1}>
          <Controller
            name="text"
            control={control}
            render={({ field }) => {
              const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(
                null
              );

              const openPicker = (event: React.MouseEvent<HTMLElement>) => {
                setAnchorEl(event.currentTarget);
              };

              const closePicker = () => {
                setAnchorEl(null);
              };

              const open = Boolean(anchorEl);

              const handleEmojiClick = (emojiData: any) => {
                const emoji = emojiData.emoji;
                field.onChange((field.value ?? "") + emoji);
              };

              return (
                <>
                  <TextField
                    {...field}
                    placeholder="Escribe un comentario..."
                    multiline
                    fullWidth
                    minRows={1}
                    maxRows={6}
                    size="small"
                    variant="outlined"
                    error={!!errors.text}
                    helperText={errors.text?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        fontSize: "0.9rem",
                        paddingY: "6px",
                      },
                      "& textarea": {
                        overflow: "hidden !important",
                      },
                    }}
                  />

                  <Box display="flex" justifyContent="flex-start" mt={0.5}>
                    <IconButton size="small" onClick={openPicker}>
                      <EmojiEmotionsIcon fontSize="small" />
                    </IconButton>

                    <Popover
                      open={open}
                      anchorEl={anchorEl}
                      onClose={closePicker}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        height={350}
                      />
                    </Popover>
                  </Box>
                </>
              );
            }}
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
