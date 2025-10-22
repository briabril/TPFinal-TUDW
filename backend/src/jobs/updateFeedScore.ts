import redis from "../redis/index";
import db from "../db";
export const updateFeedScore = async (postId: string | number) => {
  const { rows } = await db.query(`
    SELECT likes_count, comments_count, views_count, created_at
    FROM post_metrics pm
    JOIN posts p ON p.id = pm.post_id
    WHERE pm.post_id = $1
  `, [postId]);

  if (!rows.length) return;
  const { likes_count, comments_count, views_count, created_at } = rows[0];

  const hoursSincePost = (Date.now() - new Date(created_at).getTime()) / (1000 * 60 * 60);
  const recencyFactor = 1 / (1 + hoursSincePost / 24);

  const score = (likes_count * 2 + comments_count * 3 +  views_count * 0.5) * recencyFactor;

  await redis.zadd("feed_rank", score, postId.toString());
};

