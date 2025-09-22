import { Router } from "express";
import { getUsers } from "../controllers/userController";
import { editProfile } from "../controllers/userController";
import { getUser } from "../controllers/userController";

const router = Router();
router.get("/:id", getUser);      
router.put("/:id", editProfile);
router.get("/", getUsers);       


export default router;
