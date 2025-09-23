import db from "../db";

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
export const findUserByEmail = async (email:string) =>{
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}
export const findUserByUsername = async (username: string) => {
  const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
  return result.rows[0];
}
export const findUserByEmailOrUsername = async (identifier: string) => {
  const result = await db.query(
    `SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1`,
    [identifier]
  );
  return result.rows[0];
};
export const getAllUsers = async () => {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
};