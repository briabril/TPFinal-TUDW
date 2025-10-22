import { Request, Response } from "express";
import { getHybridFeed, getPersonalizedFeed } from "../models/feedModel";
import { updateUserFeed } from "../jobs/updateUserFeed";
import db from "../db";
import cron from "node-cron";

export const getFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const feed = await getHybridFeed(userId, 20);
    res.json({ success: true, data: feed });
  } catch (error) {
    console.error("Error al obtener feed", error)
    res.status(500).json({ success: false, message: "Error al obtener feed", error})
  }
};

export const getPersonalizedFeedController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const feed = await getPersonalizedFeed(userId);
    res.json({ success: true, data: feed });
  } catch (error) {
    console.error("Error al traer el feed personalizado:", error);
    res.status(500).json({ success: false, message: "Error al traer el feed personalizado" });
  }
};

//  Cron para actualizar feeds cada noche a las 4am
cron.schedule("0 4 * * *", async () => {
  try {
    const { rows } = await db.query("SELECT id FROM users");
    await Promise.all(rows.map((user) => updateUserFeed(user.id)));
    console.log("Feeds de usuarios actualizados (4 AM)");
  } catch (err) {
    console.error("Error ejecutando cron:", err);
  }
});
