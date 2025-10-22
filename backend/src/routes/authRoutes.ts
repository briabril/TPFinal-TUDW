import { Router } from "express";
import * as AuthController from "../controllers/authController"
import { authenticateJWT } from "../middleware/auth";

const router = Router()


router.post("/register", AuthController.registerUser)
router.post("/login", AuthController.loginUser)
router.get("/verify", AuthController.verifyUser)

router.use(authenticateJWT)
router.get("/me", AuthController.getMe)
router.post("/logout", AuthController.logoutUser);

export default router