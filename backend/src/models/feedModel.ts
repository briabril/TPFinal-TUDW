import db from "../db";
import redis from "../redis/index";
import { predictInteraction, loadModel } from "../ml/brainModel";

export async function getPersonalizedFeed(userId: string) {
  const cached = await redis.get(`feed:${userId}`);

  if (cached) {
    console.log(`🧱 Feed cacheado usado para usuario ${userId}`);
    return JSON.parse(cached);
  }
  const { rows: posts } = await db.query(`
    SELECT 
      p.id, p.text, p.author_id, p.created_at,
      pm.likes_count, pm.comments_count,
      COALESCE(ui.weight, 0) AS interest_weight
    FROM post p
    LEFT JOIN post_metrics pm ON pm.post_id = p.id
    LEFT JOIN user_interests ui ON ui.user_id = $1
    ORDER BY p.created_at DESC
    LIMIT 50
  `, [userId]);

  await loadModel();

  const rankedPosts = await Promise.all(posts.map(async (post) => {
    const affinity = post.interest_weight || 0;
    const popularity = post.likes_count || 0;
    const recency = Math.max(0, 1 / (1 + (Date.now() - new Date(post.created_at).getTime()) / 3600000));
    const predicted = await predictInteraction([affinity, popularity, recency]);
    const score = 0.5 * affinity + 0.3 * popularity + 0.2 * predicted;
    return { ...post, score };
  }));
  console.log(`✅ Feed generado con ${rankedPosts.length} posts para usuario ${userId}`);

  rankedPosts.sort((a, b) => b.score - a.score);
  await redis.set(`feed:${userId}`, JSON.stringify(rankedPosts), "EX", 60);
  return rankedPosts;
}
