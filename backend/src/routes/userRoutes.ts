import { Router } from "express";
import { getUsers, getMe, registerUser, loginUser, verifyUser, logoutUser , searchUsersController, getProfileByUsername, getUser, editProfile, uploadMiddleware} from "../controllers/userController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();
router.get("/", getUsers);
router.get("/me", authenticateJWT, getMe);
router.get("/search", authenticateJWT, searchUsersController);
router.get("/by-username/:username", authenticateJWT, getProfileByUsername);
router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/verify", verifyUser);
router.post("/logout", logoutUser);
router.get("/by-id/:id", authenticateJWT, getUser); 
router.put("/:id",authenticateJWT, uploadMiddleware, editProfile);
router.get("/", getUsers);       

export default router;



