import { Request, Response } from "express";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {
  createUserPendingVerification, createEmailVerification, findUserByEmail,
  findUserByEmailOrUsername, getAllUsers, activateUser, findVerificationByToken, findUserById, markVerificationUsed, findUserByUsername
} from "../models/userModel";
import { sendVerificationEmail } from "../utils/mailer";
import { searchUsers } from "../models/userModel";
import * as BlockModel from "../models/blockModel";
import * as FollowModel from "../models/followModel"
const JWT_SECRET = process.env.JWT_SECRET;
import { updateUserProfile } from "../models/userModel";
import { getUserById } from "../models/userModel";

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export const uploadMiddleware = upload.single('profile_picture_url');


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
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password, displayname } = req.body;
    if (!email || !username || !password || !displayname) {
      return res.status(400).json({ error: "Faltan campos obligatorios" })
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

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body

    if (!password || !identifier) {
      return res.status(400).json({ error: "Faltan credenciales" })
    };


    const user = await findUserByEmailOrUsername(identifier)
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ error: "Cuenta no verificada. Revisa tu correo." });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Credenciales incorrectas" })

    }
    if (!JWT_SECRET) throw new Error("Falta JWT_SECRET en variables de entorno");

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "2h" })
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 2 * 60 * 60 * 1000
    })
      .json({ message: "Login exitoso" })
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}
export const getMe = async (req: Request, res: Response) => {
  try {
    let token = req.cookies.token;

    // también aceptar el header Authorization
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded: any = jwt.verify(token, JWT_SECRET!);
    const user = await findUserById(decoded.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayname: user.displayname,
      role: user.role,
      status: user.status,
      bio: user.bio,
      profilePicture: user.profile_picture_url,
    });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};


// verificar usuario
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || req.body.token || "");
    if (!token) return res.status(400).json({ error: "Token faltante" });

    const verification = await findVerificationByToken(token);
if (!verification) return res.status(400).json({ error: "Token inválido" });

if (verification.used) {
  return res.status(200).json({ success: true, message: "Token ya usado, cuenta ya activada" });
}

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

export const editProfile = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { username, displayname, bio, profile_picture_url, password, new_password } = req.body;
  try {
    const currentUser = (req as any).user;
    if (currentUser.id !== userId && currentUser.role !== 'ADMIN') {
      return res.status(403).json({ error: "No tienes permisos para editar este perfil" });
    }

    // Obtener usuario actual para verificar contraseña
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validaciones de campos
    if (username !== undefined && username.trim() !== '') {
      if (typeof username !== 'string') {
        return res.status(400).json({ error: "El nombre de usuario debe ser texto" });
      }
      if (username.length > 30) {
        return res.status(400).json({ error: "El nombre de usuario no puede exceder 30 caracteres" });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: "El nombre de usuario solo puede contener letras, números y guiones bajos" });
      }
      
      const existingUser = await findUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: "Este nombre de usuario ya está en uso" });
      }
    }

    if (displayname !== undefined) {
      if (typeof displayname !== 'string' || displayname.trim().length === 0) {
        return res.status(400).json({ error: "El nombre para mostrar no puede estar vacío" });
      }
      if (displayname.length > 30) {
        return res.status(400).json({ error: "El nombre para mostrar no puede exceder 30 caracteres" });
      }
    }

    if (bio !== undefined && bio.trim() !== '') {
      if (typeof bio !== 'string') {
        return res.status(400).json({ error: "La biografía debe ser texto" });
      }
      if (bio.length > 160) {
        return res.status(400).json({ error: "La biografía no puede exceder 160 caracteres" });
      }
    }

    if (profile_picture_url !== undefined && profile_picture_url !== null && profile_picture_url !== '') {
      if (typeof profile_picture_url !== 'string') {
        return res.status(400).json({ error: "La URL de la imagen debe ser texto" });
      }
      if (profile_picture_url.length > 2048) {
        return res.status(400).json({ error: "La URL de la imagen es demasiado larga" });
      }
    }

    // Validación de contraseñas
    if (new_password && new_password.trim() !== '') {
      if (!password || password.trim() === '') {
        return res.status(400).json({ error: "Debes proporcionar tu contraseña actual para cambiarla" });
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: "La contraseña actual es incorrecta" });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
      }
      if (new_password.length > 128) {
        return res.status(400).json({ error: "La nueva contraseña es demasiado larga" });
      }
    }

    let updateData: any = {};
    
    if (username !== undefined && username.trim() !== '') {
      updateData.username = username.trim();
    }
    if (displayname !== undefined) {
      updateData.displayname = displayname.trim();
    }
    if (bio !== undefined) {
      updateData.bio = bio.trim();
    }
    if (req.file) {
      
      updateData.profile_picture_url = `ARCHIVO_SUBIDO_${Date.now()}.${req.file.originalname}`;
    }
    if (new_password && new_password.trim() !== '') {
      updateData.password_hash = await bcrypt.hash(new_password, 10);
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
    }
    const updatedUser = await updateUserProfile(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { password_hash, ...safeUser } = updatedUser;
    
    res.json({ 
      message: "Perfil actualizado exitosamente", 
      user: safeUser 
    });
    
  } catch (err: any) {
    console.error("Error al actualizar perfil:", err);
    
    
    if (err.code === '23505') {
      if (err.constraint?.includes('username')) {
        return res.status(409).json({ error: "Este nombre de usuario ya está en uso" });
      }
      if (err.constraint?.includes('email')) {
        return res.status(409).json({ error: "Este email ya está en uso" });
      }
    }
    
    res.status(500).json({ error: "Error interno del servidor" });
  }
};



export const searchUsersController = async (req: Request, res: Response) => {
  try {
    const { search } = req.query
    const userId = (req as any).user.id
    if (!search || typeof search !== "string") {
      return res.status(400).json({ message: "Parámetro de búsqueda requerido" })
    }
    const blockedIds = await BlockModel.getBlockedUserIds(userId);
    const excludeIds = [...blockedIds, userId];

    const users = await searchUsers(search, excludeIds);

    res.json({ results: users });
  } catch (err) {
    console.error("Error en búsqueda:", err);
    res.status(500).json({ error: "Error al buscar usuarios" });
  }
};

export const getProfileByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = (req as any).user?.id;

    console.log("getProfileByUsername called", { username, currentUserId });

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const blockedByThem = await BlockModel.hasBlocked(user.id, currentUserId);
    if (blockedByThem) {
      return res.status(403).json({ message: "No puedes ver este perfil" });
    }

    const [followers, following, iFollow, followsMe] = await Promise.all([
      FollowModel.getFollowRelations(user.id, "followers"),
      FollowModel.getFollowRelations(user.id, "following"),
      FollowModel.isFollowing(currentUserId, user.id),
      FollowModel.isFollowing(user.id, currentUserId),
    ]);

    const profileData = {
      ...user,
      followers_count: followers.length,
      following_count: following.length,
      followers,
      following,
      followStatus: {
        iFollow,
        followsMe,
      },
    };

    return res.json(profileData);
  } catch (err) {
    console.error("getProfileByUsername error:", err);
    res.status(500).json({ error: "Error al obtener el perfil" });
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
