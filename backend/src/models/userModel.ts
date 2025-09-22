import db from "../db";

export const getAllUsers = async () => {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
};

export const updateUserProfile = async (
  id: string,
  { username, displayname, bio, profile_picture_url }:
  { username?: string; displayname?: string; bio?: string; profile_picture_url?: string; }
) => {
  const result = await db.query(
    `UPDATE users SET
      username = COALESCE($2, username),
      displayname = COALESCE($3, displayname),
      bio = COALESCE($4, bio),
      profile_picture_url = COALESCE($5, profile_picture_url),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [id, username, displayname, bio, profile_picture_url]
  );
  return result.rows[0];
};

export const getUserById = async (id: string) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};
 