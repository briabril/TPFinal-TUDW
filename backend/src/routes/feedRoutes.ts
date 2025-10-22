import express from "express";
import { authenticateJWT } from "../middleware/auth";
import { getPersonalizedFeedController } from "../controllers/feedController";

const router = express.Router();

router.get("/:userId",authenticateJWT, getPersonalizedFeedController);

export default router;
