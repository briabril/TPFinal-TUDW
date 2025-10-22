import db from "../src/db";
import redis from "../src/redis/index";
export const adaptUserPreferences = async (userId: string | undefined, postId:string, action: any) => {
  const weightMap: Record<"like" | "comment" | "view" | "report", { affinity: number; popularity: number }> = {
    like: { affinity: 0.02, popularity: 0.01 },
    comment: { affinity: 0.03, popularity: 0.01 },
    view: { affinity: 0.005, popularity: 0.005 },
    report: { affinity: -0.05, popularity: -0.05 },
  };

const change = weightMap[action as keyof typeof weightMap];
  if (!change) return;

  const { rows: prefs } = await db.query(
    "SELECT weight_affinity, weight_popularity FROM user_preferences WHERE user_id = $1",
    [userId]
  );

  const current = prefs[0] || { weight_affinity: 0.7, weight_popularity: 0.3 };
  let newAffinity = current.weight_affinity + change.affinity;
  let newPopularity = current.weight_popularity + change.popularity;

  // Normalizamos entre 0 y 1
  const total = newAffinity + newPopularity;
  newAffinity = Math.max(0, Math.min(1, newAffinity / total));
  newPopularity = Math.max(0, Math.min(1, newPopularity / total));

  await db.query(
    "UPDATE user_preferences SET weight_affinity = $1, weight_popularity = $2, updated_at = NOW() WHERE user_id = $3",
    [newAffinity, newPopularity, userId]
  );

  // Guardamos cacheado en Redis para el ranking inmediato
  await redis.hset(`user_prefs:${userId}`, {
    affinity: newAffinity.toFixed(3),
    popularity: newPopularity.toFixed(3),
  });
};
