import db from "../db";
import { DbUser as User } from "@tpfinal/types";

export const createUser = async (
  email: string,
  username: string,
  passwordHash: string,
  displayname: string
): Promise<User> => { //agrego la promesa de tipo ya que si no, es 'any', lo que no es común en typescript
  const result = await db.query(
    `INSERT INTO users (email, username, password_hash, displayname) 
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, username, displayname, role, status`,
    [email, username, passwordHash, displayname]
  );
  return result.rows[0] as User; // casteo a User para asegurar el tipo
}

// buscar usuarios
export async function searchUsers(searchTerm: string, excludeIds: string[]): Promise<any[]> {
  const query = `
    SELECT 
      id, 
      username, 
      displayname, 
      role, 
      status, 
      profile_picture_url
    FROM users
    WHERE (username ILIKE $1 OR displayname ILIKE $1)
    AND role = 'USER'
    AND (array_length($2::uuid[], 1) IS NULL OR id <> ALL($2::uuid[]))
    LIMIT 20
  `;

  const values = [`%${searchTerm}%`, excludeIds.length > 0 ? excludeIds : null];
  const { rows } = await db.query(query, values);

  return rows;
}


// crear usuario suspendido
export const createUserPendingVerification = async (
  email: string,
  username: string,
  passwordHash: string,
  displayname: string
): Promise<User> => {
  const result = await db.query(
    `INSERT INTO users (email, username, password_hash, displayname, status)
     VALUES ($1, $2, $3, $4, 'SUSPENDED')
     RETURNING id, email, username, displayname, role, status`,
    [email, username, passwordHash, displayname]
  );
  return result.rows[0] as User;
};

// encontrar usuario por id
export const findUserById = async (id: string) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};


// encontrar usuario por email
export const findUserByEmail = async (email:string): Promise<User | null> => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}

// encontrar usuario por username
export const findUserByUsername = async (username: string): Promise<User | null> => {
  const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
  return result.rows[0] || null;
};

// encontrar usuario por email o username
export const findUserByEmailOrUsername = async (identifier: string): Promise<User | null> => {
  const result = await db.query(
    `SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1`,
    [identifier]
  );
  return result.rows[0] || null;
};

// traer a todos los usuarios
export const getAllUsers = async (): Promise<User[]> => {
  const result = await db.query("SELECT * FROM users");
  return result.rows as User[];
};

export const updateUserProfile = async (
  id: string,
  { username, displayname, bio, profile_picture_url, password_hash, country_iso, city }:
  { username?: string; displayname?: string; bio?: string; profile_picture_url?: string; password_hash?: string; country_iso?:string, city?:string}
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
  if (country_iso !== undefined) {
  fields.push(`country_iso = COALESCE($${idx++}, country_iso)`);
  values.push(country_iso);
}
  if (city !== undefined) {
  fields.push(`city = COALESCE($${idx++}, city)`);
  values.push(city);
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
    `SELECT * FROM email_verifications WHERE token = $1`,
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

//cambiar estado de un usuario
export const updateUserStatus = async (userId: string, status: "ACTIVE" | "SUSPENDED") => {
  const result = await db.query(
    `UPDATE users SET status = $1, updated_at = now()
    WHERE id = $2
    RETURNING id, email, username, displayname, role, status`,
    [status, userId]
  )
  return result.rows[0]
}