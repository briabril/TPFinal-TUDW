import db from "../db"

export const getPostMetricsById = async (postId: string) => {
  const { rows } = await db.query(
    `SELECT * FROM post_metrics WHERE post_id = $1`,
    [postId]
  );
  return rows[0];
};