import { Request, Response } from "express";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { createUserPendingVerification, createEmailVerification, findUserByEmail, 
findUserByEmailOrUsername, getAllUsers, activateUser, findVerificationByToken, markVerificationUsed } from "../models/userModel";
import { sendVerificationEmail } from "../utils/mailer";

const JWT_SECRET = process.env.JWT_SECRET ;


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
// registrar usuario
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
    const newUser = await createUserPendingVerification(email, username, hashed, displayname);

    // token aleatorio
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

     await createEmailVerification(newUser.id, token, expiresAt);
    await sendVerificationEmail(newUser.email, token);
    const { password_hash, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser, message: "Revisa tu email para verificar la cuenta" });;
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
        if (user.status !== "ACTIVE") {
  return res.status(403).json({ error: "Cuenta no verificada. Revisa tu correo." });
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

// verificar usuario
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || req.body.token || "");
    if (!token) return res.status(400).json({ error: "Token faltante" });

    const verification = await findVerificationByToken(token);
    if (!verification) return res.status(400).json({ error: "Token inválido o ya usado" });

    if (new Date(verification.expires_at) < new Date())
      return res.status(400).json({ error: "Token expirado" });

    await activateUser(verification.user_id);
    await markVerificationUsed(verification.id);


    return res.json({ success: true, message: "Cuenta activada" });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Error al verificar cuenta" });
  }
};

// logout usuario 
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logout exitoso" });
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
  const { username, displayname, bio, profile_picture_url, password } = req.body;
  try {
    let updateData: any = { username, displayname, bio, profile_picture_url };
    if (password && password.length > 0) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    const user = await updateUserProfile(userId, updateData);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}