"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../api/index";
import { resetPasswordData, resetPasswordSchema} from "../../schemas/rseetPasswordSchema"
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";

import { Box, Button, Container, TextField, Typography, Paper, Link } from "@mui/material";

export default function ForgotPassword() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<resetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: resetPasswordData) => {
    try {
      const res = await api.post("/auth/forgotPassword", data, { withCredentials: true });
toast.success(res.data?.message || "Si el correo existe, te llegará un mail");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error en el login");
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
        <Typography variant="h4" component="h1" align="center" fontWeight="bold" gutterBottom >
          Recuperar Contraseña
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2.5}
        >
          <TextField
            label="Email"
            type="text"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
       
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
            
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </Box>
      </Paper>
    </Container>
    </Box>
    </main>
  );
}
