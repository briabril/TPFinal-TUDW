import { Router } from "express";
import {
  insertComment,
  updateComment,
  deleteComment,
  findComment,
  getCommentsByPost,
} from "../controllers/commentController";
import { authenticateJWT } from "../middleware/auth";
const router = Router();

router.post("/post/:postId", authenticateJWT, insertComment);
router.get("/post/:postId/comments", getCommentsByPost);
router.get("/:commentId", findComment);
router.put("/:commentId", authenticateJWT, updateComment);

router.delete("/:commentId", authenticateJWT, deleteComment);
export default router;
