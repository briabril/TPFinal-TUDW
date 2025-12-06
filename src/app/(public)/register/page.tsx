"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../api/index";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterData } from "../../../schemas/registerSchema";
import toast from "react-hot-toast";
import { Box, Button, TextField, Typography, Paper, Link,
  InputAdornment,
  IconButton } from "@mui/material";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";
import {Eye ,EyeClosed } from "lucide-react"
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
 const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
     const { confirmPassword, ...rest } = data; 
    try {
      await api.post("/auth/register", rest);
      toast.success("Registro exitoso 🎉 Revisa tu correo");
      router.push("/checkEmail");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error en el registro");
    }
  };

  return (
    <main className="w-full ">
     <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      px={4}
      sx={{position:"relative", width: '100%'}}
    >
      <div className="absolute top-3 right-4">
         <ThemeToggle  />
      </div>
       {/* Motion wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ width: "100%" }}
          >
        
      <Paper
        elevation={6}
        sx={{
          px: { xs: 3, md: 5 },
          py: 2,
          borderRadius: 4,
          width: "100%",
          maxWidth: 520,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
            {/* Logo */}
            <motion.img
              src="/logo.png"
              alt="Bloop"
              width={80}
              height={80}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
            />
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Crear Cuenta
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2.5}
        >
          <TextField
            label="Usuario"
            fullWidth
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Nombre a mostrar"
            fullWidth
            {...register("displayname")}
            error={!!errors.displayname}
            helperText={errors.displayname?.message}
          />

          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
                InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <Eye /> : <EyeClosed />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
             <TextField
              label="Repetir contraseña"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <Eye /> : <EyeClosed />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={isSubmitting}
            sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </Button>
        </Box>
               <Button
  variant="contained"
  color="inherit"
  
  onClick={() => (window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`)}
  startIcon={<img src="/google-icon.png" alt="Google" width={20} height={20} />}
  sx={{
    borderColor: "#ccc",
    textTransform: "none",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  Continuar con Google
</Button>
        <Typography variant="body2" align="center" color="text.primary">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            underline="hover"
            sx={{ fontWeight: 600, cursor: "pointer" }}
          >
            Inicia sesión aquí
          </Link>
        </Typography>
      </Paper>
    </motion.div>
    </Box>
    </main>
  );
}
