import { Router } from "express";
import { 
  createPostController, 
  listPostsController, 
  getPostByIdController,
  blockPostController
} from "../controllers/postController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.get("/", listPostsController);
router.get("/mine", authenticateJWT, (req, res) => require("../controllers/postController").myPostsController(req, res));
router.post("/", authenticateJWT, createPostController);

router.get("/:id", authenticateJWT, getPostByIdController);
router.delete("/:id", authenticateJWT, (req, res) => require("../controllers/postController").deletePostController(req, res));
router.patch("/:id", authenticateJWT, (req, res) => require("../controllers/postController").updatePostController(req, res));

export default router;
