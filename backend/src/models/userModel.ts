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