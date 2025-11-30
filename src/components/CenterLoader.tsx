"use client"
import { Box, Typography, CircularProgress } from "@mui/material";
const CenteredLoader = ({ message = "Cargando..." }) => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    }}
  >
    <CircularProgress size={60} thickness={4} />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);
export default CenteredLoader
