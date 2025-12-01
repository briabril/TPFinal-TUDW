import {z} from "zod";

export const resetPasswordSchema = z.object({
    email: z.email({ message: "El email no es válido" }),
})
export type resetPasswordData = z.infer<typeof resetPasswordSchema>;