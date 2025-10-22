import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { getAllUsers } from "../models/userModel";
import { searchUsers } from "../models/userModel";
import { findUserByIdentifier } from "../models/authModel";
import * as BlockModel from "../models/blockModel";
import * as FollowModel from "../models/followModel"
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

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
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
      
      const existingUser = await findUserByIdentifier(username);
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

    const user = await findUserByIdentifier(username);
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

