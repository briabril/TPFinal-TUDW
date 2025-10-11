// frontend/src/app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

import { Box, Typography, Button, Paper } from "@mui/material";

function PublicHome() {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      width={"w-full"}
      px={4}
      sx={{position:"relative"}}
    >
      <div className="absolute top-4 right-4">
         <ThemeToggle  />
      </div>
     
      <Paper elevation={6} sx={{ p: 5, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" mb={2}>
          Bienvenido a "la red" social
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Conéctate con tus amigos y comparte momentos especiales
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            color="primary"
          >
            Iniciar Sesión
          </Button>
          <Button
            component={Link}
            href="/register"
            variant="contained"
            color="success"
          >
            Crear Cuenta
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}


export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
    
        router.replace("/feed");
      
    }
  }, [user, loading, router]);

  if (loading)
    return (
      <Box className="min-h-screen flex items-center justify-center bg-gray-50">
        <Typography className="text-gray-600">Cargando...</Typography>
      </Box>
    );

  if (!user) {
    return <PublicHome />;
  }

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50">
      <Typography className="text-gray-600">Redirigiendo...</Typography>
    </Box>
  );
}
