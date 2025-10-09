import { getCommentLikes, getPostLikes, toggleCommenLike, togglePostLike } from "../controllers/reactionController";
import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";

const router = Router ();
router.post("/", authenticateJWT, togglePostLike);
router.post("/comment", authenticateJWT, toggleCommenLike);
router.get("/post/:post_id/likes", getPostLikes);
router.get("/post/:post_id/:comment_id/likes", getCommentLikes);
export default router