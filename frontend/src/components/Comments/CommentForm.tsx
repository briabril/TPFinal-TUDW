import {useForm} from "react-hook-form";
import api from "@/lib/axios";
import { Comment } from "@/types/comment";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, CommentFormData } from "@/schemas/commentSchema";
import { TextField, Button, Box } from "@mui/material";
import toast from "react-hot-toast";

interface Props{
    postId: string | number;
    parentId?: string | number | null;
    onSubmit: (data: CommentFormData, parentId?: string | number | null) => void;
}
const CommentForm: React.FC<Props> =({ onSubmit}) =>{
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<CommentFormData>({resolver: zodResolver(commentSchema)})
    
     const handleFormSubmit = (data: CommentFormData) => {
    onSubmit(data);
    reset();
  };
    
    return(
       <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-2 mt-2">
        <TextField
        {...register("text")}
        label="Escribe un comentario"
        multiline
        rows={2}
        fullWidth
        error={!errors.text}
        helperText={errors.text?.message}/>
        <Button type="submit" variant="contained" color="primary">
            Publicar
        </Button>
       </Box>
    )
}
export default CommentForm;
