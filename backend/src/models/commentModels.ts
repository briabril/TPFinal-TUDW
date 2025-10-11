import db from "../db";

export interface Comment {
  id: string;
  author_id: string;
    author_username: string;
  post_id: string;
  text: string;
  parent_id?: string | null;
  created_at: Date;
  updated_at?: Date;
}

const MAX_DEPTH = 6;

export const insertCommentDB = async (
  author_id: string,
  post_id: string,
  text: string,
  parent_id?: string | null
): Promise<Comment> => {
  const result = await db.query<Comment>(
    `INSERT INTO user_comments (author_id, post_id, text, parent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, author_id, post_id, text, parent_id, created_at, updated_at`,
    [author_id, post_id, text, parent_id || null]
  );
  return result.rows[0];
};

export const getCommentDepth = async (commentId: string) => {
  const result = await db.query<{ depth: number }>(
    `
    WITH RECURSIVE comment_ancestors AS (
      SELECT id, parent_id, 1 AS depth
      FROM user_comments
      WHERE id = $1
      UNION ALL
      SELECT parent_comment.id, parent_comment.parent_id, comment_ancestors.depth + 1 AS depth
      FROM user_comments AS parent_comment
      JOIN comment_ancestors ON parent_comment.id = comment_ancestors.parent_id
      WHERE comment_ancestors.depth < $2
    )
    SELECT MAX(depth) AS depth
    FROM comment_ancestors;
    `,
    [commentId, MAX_DEPTH]
  );
  return result.rows[0]?.depth || 1;
};

export const deleteCommentDB = async (commentId: string) => {
  await db.query("DELETE FROM user_comments WHERE id = $1", [commentId]);
};

export const updateCommentDB = async (commentId: string, text: string) => {
  const result = await db.query<Comment>(
    `UPDATE user_comments
     SET text = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [text, commentId]
  );
  return result.rows[0];
};

export const getCommentsByPostDB = async (postId: string) => {
  const result = await db.query<Comment>(
    `
    SELECT 
     c.id,
      c.author_id,
      u.username AS author_username,
      c.post_id,
      c.text,
      c.created_at,
      c.parent_id
    FROM user_comments c
     JOIN users u ON c.author_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
    `,
    [postId]
  );
  return result.rows;
};

export const findCommentDB = async (commentId: string) => {
  const result = await db.query<Comment>(
     `
    SELECT 
      c.id,
      c.author_id,
      u.username AS author_username,
      c.post_id,
      c.text,
      c.created_at,
      c.parent_id
    FROM user_comments c
    JOIN users u ON c.author_id = u.id
    WHERE c.id = $1
    `,
    [commentId]
  );
  return result.rows[0];
};
