import express from "express";
import { getRecommendationsController } from "../controllers/recomendationController";
import { loadModel } from "../ml/brainModel";

const router = express.Router();

// cargar modelo al iniciar
loadModel();

router.get("/:userId", getRecommendationsController);

export default router;
