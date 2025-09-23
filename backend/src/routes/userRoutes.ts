import { Router } from "express";
import { getUsers, getMe, registerUser, loginUser, verifyUser } from "../controllers/userController";

const router = Router();
router.get("/", getUsers);
router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/verify", verifyUser);
export default router;
