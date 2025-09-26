import { Router } from "express";
import { getUsers, getMe, registerUser, loginUser, verifyUser, logoutUser, editProfile, getUser } from "../controllers/userController";

const router = Router();
router.get("/", getUsers);
router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/verify", verifyUser);
router.post("/logout", logoutUser);
router.get("/:id", getUser);      
router.put("/:id", editProfile);
router.get("/", getUsers);       

export default router;



