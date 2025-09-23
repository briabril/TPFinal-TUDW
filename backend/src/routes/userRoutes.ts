import { Router } from "express";
import { getUsers, getMe, registerUser, loginUser } from "../controllers/userController";

const router = Router();
router.get("/", getUsers);
router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser)
export default router;
