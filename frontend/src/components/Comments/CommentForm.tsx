import {useForm, Controller} from "react-hook-form";
import api from "@/lib/axios";
import { Comment } from "../../types/comment";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, CommentFormData } from "@/schemas/commentSchema";
import { TextField, Button, Box , } from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props{
    postId: string | number;
    parentId?: string | number | null;
    onSubmit: (data: CommentFormData, parentId?: string | number | null) => void;
}
const CommentForm: React.FC<Props> =({ onSubmit}) =>{
      const [textValue, setTextValue] = useState("");

    const {
        control,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<CommentFormData>({resolver: zodResolver(commentSchema)})
    
     const handleFormSubmit = (data: CommentFormData) => {
    onSubmit(data);
    reset();
     setTextValue("");
  };
    
    return(
       <Box className="border border-gray-200 rounded-lg p-3 mb-2" component="form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-2 mt-2">
        <Controller
         name="text"
        control={control}
     render={({ field }) => (
          <TextField
            {...field}
            placeholder="Escribe un comentario"
            multiline
            rows={2}
            fullWidth
            variant="outlined"
            size="small"
            onChange={(e) => {
              field.onChange(e);
              setTextValue(e.target.value);
            }}
            error={!!errors.text}
            helperText={errors.text?.message}
          />
        )}
      />
    
       
      {textValue.trim() && (
        <Box className="flex justify-end">
          <Button
            type="submit"
            className="bg-blue-500 text-white rounded-full px-4 py-1 hover:bg-blue-600 transition-colors"
          >
            Publicar
          </Button>
        </Box>
      )}
      </Box>
    )
}
export default CommentForm;
