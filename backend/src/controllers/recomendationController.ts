import { Request, Response } from "express";
import { getRecommendations } from "../services/recomendationService";

export async function getRecommendationsController(req: Request, res: Response) {
  const { userId } = req.params;
  try {
    const recommendations = await getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error("❌ Error generando recomendaciones:", error);
    res.status(500).json({ error: "Error generando recomendaciones" });
  }
}
