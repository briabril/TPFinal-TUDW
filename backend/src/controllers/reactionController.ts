import { count } from "console";
import { getPostLikesCount, getCommentLikesCount, toggleCommenLikeDB, togglePostLikeDB } from "../models/reactionModel";
import { Request, Response } from "express";

export const togglePostLike = async (req: Request, res: Response) =>{
    try{
        const user_id = req.user?.id;
    const {post_id} =req.body;
    if(!user_id || !post_id){
         return res.status(400).json({ message: "Faltan datos (user_id o post_id)" });
    }
     const result = await togglePostLikeDB (user_id, post_id);
     return res.status(200).json(result)
    }catch(error: any){
        console.error("Error al dar like al post");
        res.status(500).json({message:"Error del servidor"})
    }

}
export const toggleCommenLike = async (req: Request, res: Response) =>{
    try{
        const user_id = req.user?.id;
    const {comment_id} =req.body;
    if(!user_id || !comment_id){
         return res.status(400).json({ message: "Faltan datos (user_id o comment_id)" });
    }
     const result = await toggleCommenLikeDB (user_id, comment_id);
     return res.status(200).json(result)
    }catch(error: any){
        console.error("Error al dar like al post");
        res.status(500).json({message:"Error del servidor"})
    }

}
export const getPostLikes = async (req: Request, res: Response) =>{
    try{
        const { post_id} = req.params;
        const cout = await getPostLikesCount(post_id)
        return res.status(200).json({likes: count})
    }catch(error: any){
        console.error("Error al traer la cantidad de likes")
        res.status(500).json({message: "Error en el servidor"})
    }
}
export const getCommentLikes = async (req: Request, res: Response) =>{
    try{
        const { comment_id} = req.params;
        const count = await getCommentLikesCount(comment_id)
        return res.status(200).json({likes:count})
    }catch(error: any){
        console.error("Error al traer la cantidad de likes")
        res.status(500).json({message: "Error en el servidor"})
    }
}