import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { createUser, findUserByEmail, 
findUserByEmailOrUsername, getAllUsers } from "../models/userModel";

const JWT_SECRET = process.env.JWT_SECRET ;

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const registerUser = async (req: Request, res: Response) =>{
  try{
    const { email, username, password, displayname} = req.body;
  if (!email || !username || !password || !displayname){
    return res.status(400).json({error: "Faltan campos obligatorios"})
  }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await createUser(email, username, hashed, displayname);
    const { password_hash, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  }
   catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
}
export const loginUser = async (req: Request, res: Response) =>{
  try{
    const {identifier, password} = req.body

    if(!password || !identifier){
      return res.status(400).json({error: "Faltan credenciales"})
    };


    const user = await findUserByEmailOrUsername(identifier)
    if(!user){
      return res.status(401).json({error: "Credenciales inválidas"})
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if(!match){
      return res.status(401).json({error: "Credenciales incorrectas"})
      
    }
    if (!JWT_SECRET) throw new Error("Falta JWT_SECRET en variables de entorno");

    const token = jwt.sign({id: user.id, email: user.email, role: user.role }, JWT_SECRET, {expiresIn:"2h"})
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000
    })
    .json({message: "Login exitoso"})
  }catch(err){
    console.error("Login error:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}
export const getMe = async (req: Request, res: Response) =>{
  try{
    const token = req.cookies.token;
    if(!token) return res.status(401).json({error : "No autenticado"})
       const decoded: any = jwt.verify(token, JWT_SECRET!);
      const user = await findUserByEmail(decoded.email);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({
          id: user.id,
          email: user.email,
          username : user.username,
          displayname: user.displayname,
          role: user.role,
          status: user.status,
          bio: user.bio,
          profilePicture: user.profile_picture_url,

        });
  }catch(err){
    res.status(401).json({error : "Token inválido"})
  }
}