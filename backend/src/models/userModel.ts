import db from "../db";

export const getAllUsers = async () => {
  const result = await db.query("SELECT * FROM user");
  return result.rows;
};