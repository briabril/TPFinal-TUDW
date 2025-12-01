import {z} from "zod";

export const changePasswordSchema = z.object({
     password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
           confirmPassword: z.string().min(6, "Debes repetir la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type changePasswordData = z.infer<typeof changePasswordSchema>;