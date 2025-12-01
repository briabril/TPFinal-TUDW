import {z} from "zod";

export const registerSchema = z.object({
    username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    email: z.email({ message: "El email no es válido" }),
    displayname: z.string().min(2, "El nombre a mostrar es obligatorio"),
     password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
       confirmPassword: z.string().min(6, "Debes repetir la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type RegisterData = z.infer<typeof registerSchema>;