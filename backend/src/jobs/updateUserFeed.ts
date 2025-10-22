import redis from "../redis/index";
import db from "../db";

export const updateUserFeed = async (userId: string) => {
  const prefRes = await db.query(
    "SELECT weight_affinity, weight_popularity FROM user_preferences WHERE user_id = $1",
    [userId]
  );
  const prefs = prefRes.rows[0] || { weight_affinity: 0.7, weight_popularity: 0.3 };

  const interestsRes = await db.query(
    "SELECT topic_name FROM user_interests WHERE user_id = $1",
    [userId]
  );
  const userInterests = interestsRes.rows.map((r) => r.topic_name);

  const postsRes = await db.query(`
    SELECT p.id, array_agg(pt.topic_name) AS topics
    FROM post p
    LEFT JOIN post_topics pt ON pt.post_id = p.id
    GROUP BY p.id
  `);

  // Obtener ranking global
const globalScores = await redis.zrange("feed_rank", 0, -1, "WITHSCORES");

// Transformar en mapa { postId: score }
const globalMap: Record<string, number> = {};
for (let i = 0; i < globalScores.length; i += 2) {
  globalMap[globalScores[i]] = parseFloat(globalScores[i + 1]);
}

// Normalizar los scores globales entre 0 y 1
const scores = Object.values(globalMap);
const minScore = Math.min(...scores);
const maxScore = Math.max(...scores);

for (const key in globalMap) {
  if (maxScore !== minScore) {
    globalMap[key] = (globalMap[key] - minScore) / (maxScore - minScore);
  } else {
    globalMap[key] = 0.5;
  }
}

// Calcular el feed personalizado
for (const post of postsRes.rows) {
  const globalPopularity = globalMap[post.id] || 0;

  const matching = post.topics?.filter((t: string) => userInterests.includes(t)) ?? [];
  const affinity = matching.length / (post.topics?.length || 1);

  // 🎯 Ahora ambas métricas (affinity y popularity) van de 0 a 1
  const personalizedScore =
    prefs.weight_affinity * affinity +
    prefs.weight_popularity * globalPopularity;

  pipeline.zadd(`feed_rank_user:${userId}`, personalizedScore, post.id.toString());
}

await pipeline.exec();
console.log(`✅Feed actualizado para usuario ${userId}`);

}