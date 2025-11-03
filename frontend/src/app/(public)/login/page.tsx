"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@tpfinal/api";
import { loginData, loginSchema} from "@tpfinal/schemas"
import { useAuth } from "@/context/AuthContext";
import { User } from "@tpfinal/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";

import { Box, Button, Container, TextField, Typography, Paper, Link } from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<loginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: loginData) => {
    try {
      await api.post("/auth/login", data, { withCredentials: true });
      const me = await api.get<User>("/auth/me", { withCredentials: true });
      setUser(me.data);
      toast.success("Login exitoso 🎉");

      if (me.data.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/feed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error en el login");
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
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
     
      }}
    >
 
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Iniciar Sesión
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2.5}
        >
          <TextField
            label="Email o Usuario"
            type="text"
            fullWidth
            {...register("identifier")}
            error={!!errors.identifier}
            helperText={errors.identifier?.message}
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
            {isSubmitting ? "Ingresando..." : "Ingresar"}
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
     Iniciar sesión con Google
   </Button>
        <Typography variant="body2" align="center" color="text.secondary">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            underline="hover"
            sx={{ fontWeight: 600, cursor: "pointer" }}
          >
            Regístrate aquí
          </Link>
        </Typography>
      </Paper>
    </Container>
    </Box>
    
  );
}
