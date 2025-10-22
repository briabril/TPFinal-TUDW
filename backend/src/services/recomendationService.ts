import db from "../db";
import { predictInteraction } from "../ml/brainModel";

export async function getRecommendations(userId: string) {
  const { rows: posts } = await db.query(
    `
    SELECT p.id, p.created_at, pm.likes_count, ui.affinity_score
    FROM post p
    LEFT JOIN post_metrics pm ON pm.post_id = p.id
    LEFT JOIN user_interactions ui ON ui.user_id = $1 AND ui.post_id = p.id
    LIMIT 20;
  `,
    [userId]
  );

  const recommendations = posts.map((p: any) => {
    const recencyHours =
      (Date.now() - new Date(p.created_at).getTime()) / 3600000;
    const features = [
      p.affinity_score ?? 0,
      p.likes_count ?? 0,
      Math.max(0, 1 / (1 + recencyHours)),
    ];
    const score = predictInteraction(features);
    return { postId: p.id, score };
  });

  return recommendations.sort((a, b) => b.score - a.score);
}
