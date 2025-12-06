"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import CenteredLoader from "@/components/CenterLoader";
import { motion } from "framer-motion";

import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from "@mui/material";

function PublicHome() {
  const theme = useTheme();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection={{lg: "row", md: "row", xs: "column"}}
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      width="100%"
      sx={{gap: 4}}
    >
      {/* Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo + Frase */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          gap: 3,
          textAlign: "center",
          pr: { md: 6 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Logo de Bloop"
            sx={{
              maxHeight: { xs: 180, md: 220 },
              maxWidth: { xs: 300, md: 350 },
              filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.15))",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color="text.primary"
            sx={{
              maxWidth: 360,
              lineHeight: 1.3,
              opacity: 0.9,
              textAlign: "center",
            }}
          >
            Compartí momentos, conectate con personas <br />
            y descubrí nuevas historias.
          </Typography>
        </motion.div>
      </Box>

      {/* CARD */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          style={{ width: "100%" }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 5,
              borderRadius: 3,
              textAlign: "center",
              maxWidth: 360,
              mx: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
            }}
          >
            {/* Título h5 */}
            <Typography
              variant="h5"
              fontWeight="bold"
              color="text.primary"
              mb={2}
            >
              Empezá a usar bloop
            </Typography>

      

            <Box display="flex" flexDirection="column" gap={2}>
              
              {/* Botón 1 */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  fullWidth
                  component={Link}
                  href="/login"
                  variant="contained"
                  color="primary"
                >
                  Iniciar Sesión
                </Button>
              </motion.div>

              {/* Botón 2 */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  fullWidth
                  component={Link}
                  href="/register"
                  variant="contained"
                  color="success"
                >
                  Crear Cuenta
                </Button>
              </motion.div>

              {/* Botón Google */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  onClick={() =>
                    (window.location.href =
                      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`)
                  }
                  startIcon={
                    <img
                      src="/google-icon.png"
                      alt="Google"
                      width={20}
                      height={20}
                    />
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Continuar con Google
                </Button>
              </motion.div>

            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/feed");
  }, [user, loading, router]);

  if (loading) return <CenteredLoader />;

  if (!user) return <PublicHome />;

  return <CenteredLoader />;
}
