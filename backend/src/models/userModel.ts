import db from "../db";
// crear usuario activo
export const createUser = async (
  email: string,
  username: string,
  passwordHash: string,
  displayname: string
) => {
  const result = await db.query(
    `INSERT INTO users (email, username, password_hash, displayname) 
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, username, displayname, role, status`,
    [email, username, passwordHash, displayname]
  );
  return result.rows[0]
}
// crear usuario suspendido
export const createUserPendingVerification = async (
  email: string,
  username: string,
  passwordHash: string,
  displayname: string
) => {
  const result = await db.query(
    `INSERT INTO users (email, username, password_hash, displayname, status)
     VALUES ($1, $2, $3, $4, 'SUSPENDED')
     RETURNING id, email, username, displayname, role, status`,
    [email, username, passwordHash, displayname]
  );
  return result.rows[0];
};
// encontrar usuario por email
export const findUserByEmail = async (email:string) =>{
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}
// encontrar usuario por username
export const findUserByUsername = async (username: string) => {
  const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
  return result.rows[0];
}
// encontrar usuario por email o username
export const findUserByEmailOrUsername = async (identifier: string) => {
  const result = await db.query(
    `SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1`,
    [identifier]
  );
  return result.rows[0];
};
// traer a todos los usuarios
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
 