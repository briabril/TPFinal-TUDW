import db from "../db";
import { randomUUID } from "crypto";

export const createMedia = async (url: string, type: string, size: number, uploaderId?: string, post_id?: string | null) => {
  const id = randomUUID();
  
  const q = `
    INSERT INTO media (id, post_id, url, type, width, height)
    VALUES ($1, $2, $3, $4, NULL, NULL)
    RETURNING *`;
  const r = await db.query(q, [id, post_id, url, type]);
  return r.rows[0];
};

export const createPost = async ({ author_id, text, link_url, media_id }:
  { author_id: string; text: string; link_url?: string | null; media_id?: string | null }) => {
  const id = randomUUID();
  const q = `
    INSERT INTO post (id, author_id, text, link_url, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING *`;
  const r = await db.query(q, [id, author_id, text, link_url]);
  
  if (media_id) {
    await db.query(`UPDATE media SET post_id = $1 WHERE id = $2`, [r.rows[0].id, media_id]);
  }
  return r.rows[0];
};

export const getPosts = async () => {
  const q = `
    SELECT p.*, u.id as author_id,
  COALESCE(json_agg(json_build_object('url', m.url, 'type', m.type) ORDER BY m.id) FILTER (WHERE m.id IS NOT NULL), '[]') as medias,
   COUNT(uc.id) AS comments_count
    FROM post p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN media m ON m.post_id = p.id
        LEFT JOIN user_comments uc ON uc.post_id = p.id

    WHERE p.is_blocked = FALSE
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
    LIMIT 50`;
  const r = await db.query(q, []);
  return r.rows.map(row => ({
    id: row.id,
    text: row.text,
    link_url: row.link_url,
    created_at: row.created_at,
    author: { id: row.author_id },
    medias: row.medias || [],
    comments_count: Number(row.comments_count) || 0,
  }));
};

export const getPostsByAuthor = async (authorId: string) => {
  const q = `
    SELECT p.*, u.id as author_id,
  COALESCE(json_agg(json_build_object('url', m.url, 'type', m.type) ORDER BY m.id) FILTER (WHERE m.id IS NOT NULL), '[]') as medias
    FROM post p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN media m ON m.post_id = p.id
    WHERE p.author_id = $1
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
    LIMIT 100`;
  const r = await db.query(q, [authorId]);
  return r.rows.map(row => ({
    id: row.id,
    text: row.text,
    link_url: row.link_url,
    created_at: row.created_at,
    author: { id: row.author_id },
    medias: row.medias || [],
  }));
};

export const deletePostById = async (postId: string) => {
  await db.query(`DELETE FROM post WHERE id = $1`, [postId]);
};

export const updatePostText = async (postId: string, text: string) => {
  const q = `UPDATE post SET text = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
  const r = await db.query(q, [text, postId]);
  return r.rows[0];
};

export const getPostById = async (postId: string) => {
  const q = `
    SELECT p.*, u.id as author_id,
  COALESCE(json_agg(json_build_object('url', m.url, 'type', m.type) ORDER BY m.id) FILTER (WHERE m.id IS NOT NULL), '[]') as medias
    FROM post p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN media m ON m.post_id = p.id
    WHERE p.id = $1 AND is_blocked = FALSE
    GROUP BY p.id, u.id
    LIMIT 1`;
  const r = await db.query(q, [postId]);
  if (r.rows.length === 0) return null;
  const row = r.rows[0];
  return {
    id: row.id,
    text: row.text,
    link_url: row.link_url,
    created_at: row.created_at,
    author: { id: row.author_id },
    medias: row.medias || [],
  };
};

export const blockPostById = async (postId: string) => {
  const q = `
    UPDATE post
    SET is_blocked = true
    WHERE id = $1
    RETURNING *;
  `;
  const r = await db.query(q, [postId]);
  return r.rows[0];
};
