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

router.post("/", authenticateJWT, insertComment);
router.get("/post/:postId", getCommentsByPost);
router.get("/:commentId", findComment);
router.put("/:commentId", authenticateJWT, updateComment);

router.delete("/:commentId", authenticateJWT, deleteComment);
export default router;
