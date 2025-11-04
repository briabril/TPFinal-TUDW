"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@tpfinal/api";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterData } from "@tpfinal/schemas";
import toast from "react-hot-toast";
import { Box, Button, Container, TextField, Typography, Paper, Link } from "@mui/material";
import ThemeToggle from "@/components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      await api.post("/users/register", data);
      toast.success("Registro exitoso 🎉 Revisa tu correo");
      router.push("/checkEmail");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error en el registro");
    }
  };

  return (
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
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: "40%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
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
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
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
  
  onClick={() => (window.location.href = "http://localhost:4000/auth/google")}
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
        <Typography variant="body2" align="center" color="text.secondary">
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
    </Box>
  );
}
