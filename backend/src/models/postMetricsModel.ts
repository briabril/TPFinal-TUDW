import db from "../db"

export const updatePostMetric = async (postId: string, field:"likes_count" | "comments_count" | "views_count", increment = 1) => {
  const validFields = ["likes_count", "comments_count",  "views_count"];
  if (!validFields.includes(field)) {
    throw new Error(`Campo de métrica no válido: ${field}`);
  }

  const query = `
    INSERT INTO post_metrics (post_id, ${field}, last_interaction)
    VALUES ($1, $2, NOW())
    ON CONFLICT (post_id)
    DO UPDATE
    SET ${field} = GREATEST(post_metrics.${field} + $2, 0),
        updated_at = NOW();
  `;

  await db.query(query, [postId, increment]);
};