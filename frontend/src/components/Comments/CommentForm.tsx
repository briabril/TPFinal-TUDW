import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, CommentFormData } from "@/schemas/commentSchema";
import { TextField, Button, Avatar, Paper, CircularProgress } from "@mui/material";
import { useState } from "react";

interface Props {
  postId: string | number;
  parentId?: string | number | null;
  onSubmit: (data: CommentFormData, parentId?: string | number | null) => void;
  avatarUrl?: string;
}

const CommentForm: React.FC<Props> = ({ onSubmit, parentId, avatarUrl }) => {
  const [textValue, setTextValue] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const handleFormSubmit = (data: CommentFormData) => {
    onSubmit(data, parentId);
    reset();
    setTextValue("");
  };

  const isEmpty = textValue.trim().length === 0;

  return (
    <Paper
      elevation={2}
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="
        p-3 sm:p-4 
        rounded-2xl border border-gray-200 bg-gray-50 
        transition-all duration-200 
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-400
      "
    >
      <div className="flex items-start gap-3">
        {avatarUrl && (
          <Avatar
            src={avatarUrl}
            alt="Tu avatar"
            className="w-10 h-10 border border-gray-300"
          />
        )}

        <div className="flex-1">
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
                value={textValue}
                onChange={(e) => {
                  field.onChange(e);
                  setTextValue(e.target.value);
                }}
                error={!!errors.text}
                helperText={errors.text?.message}
                className="bg-white rounded-lg"
              />
            )}
          />

          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              disabled={isEmpty || isSubmitting}
              sx={{
                color: "white",
                '&.Mui-disabled': { color: 'white' } 
              }}
              className={`
    relative flex items-center justify-center gap-2
    rounded-full px-6 py-2 font-semibold
    transition-all duration-300 ease-in-out
    ${isEmpty || isSubmitting
                  ? "bg-gradient-to-r from-blue-300 to-blue-400 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.03] shadow-md hover:shadow-lg"
                }
  `}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={18} color="inherit" thickness={5} />
                  <span>Publicando...</span>
                </>
              ) : (
                "Publicar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default CommentForm;
