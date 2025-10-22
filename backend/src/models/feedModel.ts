import db from "../db";
import redis from "../redis/index";
import { predictInteraction, loadModel } from "../ml/brainModel";

export const getHybridFeed = async (userId: string, limit = 20, days = 7) => {
 const query = `
  WITH user_prefs AS (
    SELECT
      COALESCE(weight_affinity, 0.7) AS w_aff,
      COALESCE(weight_popularity, 0.3) AS w_pop
    FROM user_preferences
    WHERE user_id = $1::uuid
    UNION ALL

  SELECT 0.7, 0.3
  WHERE NOT EXISTS (
    SELECT 1 FROM user_preferences WHERE user_id = $1::uuid
  )
),
  affinity_score AS (
    SELECT
      p.id AS post_id,
      COUNT(*)::float AS affinity_count
    FROM post_topics pt
    JOIN user_interests ui ON pt.topic_name = ui.topic_name
    JOIN post p ON p.id = pt.post_id
    WHERE ui.user_id = $1::uuid
    GROUP BY p.id
  ),
  popularity_score AS (
    SELECT
      pm.post_id,
      (pm.likes_count * 0.4 + pm.comments_count * 0.3 + pm.views_count * 0.3)::float AS popularity
    FROM post_metrics pm
  )
  SELECT
    p.id,
    p.author_id,
    p.text,
    p.created_at,
    COALESCE(a.affinity_count, 0) AS affinity,
    COALESCE(ps.popularity, 0) AS popularity,
    ROUND(
      (up.w_aff * COALESCE(a.affinity_count, 0)) +
      (up.w_pop * COALESCE(ps.popularity, 0)),
      2
    ) AS score
  FROM post p
  LEFT JOIN affinity_score a ON p.id = a.post_id
  LEFT JOIN popularity_score ps ON p.id = ps.post_id
  CROSS JOIN user_prefs up
  WHERE p.created_at > NOW() - INTERVAL '${days} days'
  ORDER BY score DESC, p.created_at DESC
  LIMIT $2;
`;

  const { rows } = await db.query(query, [userId, limit]);
  return rows;
};

export async function getPersonalizedFeed(userId: string) {
  const cached = await redis.get(`feed:${userId}`);
  if (cached) return JSON.parse(cached);

  const { rows: posts } = await db.query(`
    SELECT 
      p.id, p.text, p.author_id, p.created_at,
      pm.likes_count, pm.comments_count,
      COALESCE(ui.weight, 0) AS interest_weight
    FROM post p
    JOIN post_metrics pm ON pm.post_id = p.id
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

  rankedPosts.sort((a, b) => b.score - a.score);
  await redis.set(`feed:${userId}`, JSON.stringify(rankedPosts), "EX", 60);
  return rankedPosts;
}
