import { Router } from "express";
import { getUsers, getMe, registerUser, loginUser, verifyUser, logoutUser, searchUsersController, getProfileByUsername } from "../controllers/userController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();
router.get("/", getUsers);
router.get("/me", authenticateJWT, getMe);
router.get("/search", authenticateJWT, searchUsersController);
router.get("/:username", authenticateJWT, getProfileByUsername);
router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/verify", verifyUser);
router.post("/logout", logoutUser);

export default router;
