import { Router } from "express";
import {
  togglePostLike,
  toggleCommentLike,
  getPostLikes,
  getCommentLikes,
} from "../controllers/reactionController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

// Likes en posts
router.post("/post/:postId", authenticateJWT, togglePostLike);
router.get("/post/:postId/likes", getPostLikes);

// Likes en comentarios
router.post("/comment/:commentId", authenticateJWT, toggleCommentLike);
router.get("/comment/:commentId/likes", getCommentLikes);

export default router;
