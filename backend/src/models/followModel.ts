import db from "../db";

/** Inserta o elimina follow según la acción */
export async function toggleFollow(followerId: string, followedId: string, action: "follow" | "unfollow") {
  if (action === "follow") {
    // Try the newer column name first, then fallback to older schema
    try {
      await db.query(
        `INSERT INTO follow (follower_id, followee_id)
         VALUES ($1, $2)
         ON CONFLICT (follower_id, followee_id) DO NOTHING`,
        [followerId, followedId]
      );
    } catch (err: any) {
      if (err.code === '42703') {
        await db.query(
          `INSERT INTO follow (follower_id, followed_id)
           VALUES ($1, $2)
           ON CONFLICT (follower_id, followed_id) DO NOTHING`,
          [followerId, followedId]
        );
      } else throw err;
    }

    // Try to create a notification; don't let notification failures break follow action
    try {
      await db.query(
        `INSERT INTO notification (user_id, type, ref_id)
         VALUES ($1, 'FOLLOW', $2)
         ON CONFLICT DO NOTHING`,
        [followedId, followerId]
      );
    } catch (_) {
      // swallow notification errors
    }
  } else {
    try {
      await db.query(
        `DELETE FROM follow
         WHERE follower_id = $1 AND followee_id = $2`,
        [followerId, followedId]
      );
    } catch (err: any) {
      if (err.code === '42703') {
        await db.query(
          `DELETE FROM follow
           WHERE follower_id = $1 AND followed_id = $2`,
          [followerId, followedId]
        );
      } else throw err;
    }
  }
}

export async function isFollowing(followerId: string, followedId: string) {
  try {
    const { rowCount } = await db.query(`SELECT 1 FROM follow WHERE follower_id = $1 AND followee_id = $2`, [followerId, followedId]);
    return rowCount > 0;
  } catch (err: any) {
    if (err.code === '42703') {
      const { rowCount } = await db.query(`SELECT 1 FROM follow WHERE follower_id = $1 AND followed_id = $2`, [followerId, followedId]);
      return rowCount > 0;
    }
    throw err;
  }
}

export async function getFollowRelations(userId: string, relation: "followers" | "following") {
  const query =
    relation === "followers"
      ? `SELECT u.id, u.username, u.displayname, u.profile_picture_url
         FROM follow f
         JOIN users u ON f.follower_id = u.id
         WHERE f.followee_id = $1`
      : `SELECT u.id, u.username, u.displayname, u.profile_picture_url
         FROM follow f
         JOIN users u ON f.followee_id = u.id
         WHERE f.follower_id = $1`;

  try {
    const { rows } = await db.query(query, [userId]);
    return rows;
  } catch (err: any) {
    if (err.code === '42703') {
      // fallback to older column name `followed_id`
      const altQuery = relation === 'followers'
        ? `SELECT u.id, u.username, u.displayname, u.profile_picture_url
           FROM follow f
           JOIN users u ON f.follower_id = u.id
           WHERE f.followed_id = $1`
        : `SELECT u.id, u.username, u.displayname, u.profile_picture_url
           FROM follow f
           JOIN users u ON f.followed_id = u.id
           WHERE f.follower_id = $1`;
      const { rows } = await db.query(altQuery, [userId]);
      return rows;
    }
    throw err;
  }
}

export async function getFollowStatus(viewerId: string, targetId: string) {
  try {
    const { rows } = await db.query(
      `SELECT
        EXISTS (SELECT 1 FROM follow WHERE follower_id = $1 AND followee_id = $2) AS "isFollowing",
        EXISTS (SELECT 1 FROM follow WHERE follower_id = $2 AND followee_id = $1) AS "isFollowedBy"`,
      [viewerId, targetId]
    );
    return rows[0];
  } catch (err: any) {
    if (err.code === '42703') {
      const { rows } = await db.query(
        `SELECT
          EXISTS (SELECT 1 FROM follow WHERE follower_id = $1 AND followed_id = $2) AS "isFollowing",
          EXISTS (SELECT 1 FROM follow WHERE follower_id = $2 AND followed_id = $1) AS "isFollowedBy"`,
        [viewerId, targetId]
      );
      return rows[0];
    }
    throw err;
  }
}
