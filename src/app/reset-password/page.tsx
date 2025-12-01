"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../api/index";
import { changePasswordData, changePasswordSchema} from "../../schemas/changePassword"
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";
import { Box, Button, Container, TextField, Typography, Paper, Link, InputAdornment, IconButton } from "@mui/material";
import { Eye, EyeClosed } from "lucide-react";

export default function ChangePassword() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<changePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: changePasswordData) => {
         
const token = new URLSearchParams(window.location.search).get("token");

    try {
      const res = await api.put("/auth/updatePassword", {
  token,
  userpassword: data.password
});
toast.success(res.data?.message || "Contraseña actualizada correctamente");
              router.push("/login");

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
          Cambiar Contraseña
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2.5}
        >
        <TextField
            label="Contraseña"
           type={showPassword ? "text" : "password"}
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
                InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeClosed /> : <Eye />}
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
                      {showConfirmPassword ? <EyeClosed /> : <Eye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
