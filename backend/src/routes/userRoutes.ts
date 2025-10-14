import { Router } from "express";
import * as UserController from "../controllers/userController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

/* ----------- Public Routes ----------- */
router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.get("/verify", UserController.verifyUser);

/* ----------- Protected Routes ----------- */
router.use(authenticateJWT); // aplica auth automáticamente a todas las de abajo

router.get("/", UserController.getUsers);
router.get("/me", UserController.getMe);
router.get("/search", UserController.searchUsersController);
router.get("/by-id/:id", UserController.getUser);
router.get("/by-username/:username", UserController.getProfileByUsername);
router.post("/logout", UserController.logoutUser);
router.put("/:id", UserController.uploadMiddleware, UserController.editProfile);

export default router;
