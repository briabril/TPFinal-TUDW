import db from "../db";

export interface Comment {
  id: string;
  author_id: string;
    author_username: string;
     author_avatar: string | null;
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
    `
    INSERT INTO user_comments (author_id, post_id, text, parent_id, author_avatar)
    VALUES ($1, $2, $3, $4, (SELECT profile_picture_url FROM users WHERE id = $1))
    RETURNING id, author_id, post_id, text, parent_id, created_at, updated_at, author_avatar
    `,
    [author_id, post_id, text, parent_id || null]
  );

  const comment = result.rows[0];

  // Registrar interacción
  await db.query(`
    INSERT INTO user_interactions (user_id, post_id, interaction_type, created_at)
    VALUES ($1, $2, 'comment', NOW())
    ON CONFLICT (user_id, post_id, interaction_type) DO UPDATE SET created_at = NOW();
  `, [author_id, post_id]);

  // Agregar interés por los temas del post
  await db.query(`
    INSERT INTO user_interests (user_id, topic_id, weight)
    SELECT $1, pt.topic_id, 1.0
    FROM post_topics pt
    WHERE pt.post_id = $2
    ON CONFLICT (user_id, topic_id)
    DO UPDATE SET weight = user_interests.weight + 1.0;
  `, [author_id, post_id]);

  // Obtener username del autor
  const userResult = await db.query<{ username: string }>(
    `SELECT username FROM users WHERE id = $1`,
    [author_id]
  );

  return {
    ...comment,
    author_username: userResult.rows[0]?.username || "Unknown",
  } as Comment;
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
    // 1. Buscar el comentario
  const result = await db.query<Comment>(
    `SELECT id, author_id, post_id, text, parent_id, created_at, updated_at
     FROM user_comments
     WHERE id = $1`,
    [commentId]
  );
  const comment = result.rows[0];

  if (!comment) return null;

  // 2. Eliminarlo
  await db.query(`DELETE FROM user_comments WHERE id = $1`, [commentId]);

  // 3. Devolverlo para usar en el controlador
  return comment;
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
