import {z} from "zod";
import { registerSchema } from "./registerSchema";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const editProfilSchema = z.object({
    displayname: z.string().min(2, "El nombre a mostrar es obligatorio"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    new_password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    bio: z.string().max(160, "El máximo son 160 caracteres"),
    profile_picture_url: z.any().refine((file) => file instanceof File && file.size <= MAX_FILE_SIZE, "La imagen no puede pesar más de 8MB").refine((file) => file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file?.type), "Solo se soportan formatos jepg, jpg, png y webp"),

})
export type ProfileData = z.infer<typeof editProfilSchema>;