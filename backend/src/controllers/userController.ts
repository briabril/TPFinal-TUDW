import { Request, Response } from "express";
import { getAllUsers } from "../models/userModel";
import { updateUserProfile } from "../models/userModel";
import { getUserById } from "../models/userModel";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

export const editProfile = async (req, res) => {
  const userId = req.params.id;
  const { username, displayname, bio, profile_picture_url } = req.body;
  try {
    const user = await updateUserProfile(userId, { username, displayname, bio, profile_picture_url });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
