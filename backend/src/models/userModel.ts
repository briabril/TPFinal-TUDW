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
  { username, displayname, bio, profile_picture_url, password_hash }:
  { username?: string; displayname?: string; bio?: string; profile_picture_url?: string; password_hash?: string; }
) => {
  const fields = [];
  const values: any[] = [id];
  let idx = 2;

  if (username !== undefined) {
    fields.push(`username = COALESCE($${idx++}, username)`);
    values.push(username);
  }
  if (displayname !== undefined) {
    fields.push(`displayname = COALESCE($${idx++}, displayname)`);
    values.push(displayname);
  }
  if (bio !== undefined) {
    fields.push(`bio = COALESCE($${idx++}, bio)`);
    values.push(bio);
  }
  if (profile_picture_url !== undefined) {
    fields.push(`profile_picture_url = COALESCE($${idx++}, profile_picture_url)`);
    values.push(profile_picture_url);
  }
  if (password_hash !== undefined) {
    fields.push(`password_hash = COALESCE($${idx++}, password_hash)`);
    values.push(password_hash);
  }
  fields.push("updated_at = NOW()");

  const result = await db.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};

export const getUserById = async (id: string) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};
 

// verificar email
export const createEmailVerification = async (
  userId: string,
  token: string,
  expiresAt: Date
) => {
  await db.query(
    `INSERT INTO email_verifications (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
};
// encontrar la verificación del token
export const findVerificationByToken = async (token: string) => {
  const result = await db.query(
    `SELECT * FROM email_verifications WHERE token = $1 AND used = FALSE LIMIT 1`,
    [token]
  );
  return result.rows[0];
};

// actualizar token a verificado
export const markVerificationUsed = async (id: string) => {
  await db.query(`UPDATE email_verifications SET used = TRUE WHERE id = $1`, [
    id,
  ]);
};

// actualizar el usuario a 'activo'
export const activateUser = async (userId: string) => {
  const result = await db.query(
    `UPDATE users SET status = 'ACTIVE', updated_at = now() WHERE id = $1 RETURNING id, email, username, displayname, status`,
    [userId]
  );
  return result.rows[0];
};