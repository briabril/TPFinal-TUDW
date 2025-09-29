'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Typography, CircularProgress } from "@mui/material"

export default function Unauthorized() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    const timer = setTimeout(() => {
      router.push("/")
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [router])

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Typography variant="h3" color="error" fontWeight="bold">
        Acceso denegado
      </Typography>

      <Typography variant="body1" color="text.secondary">
        No tienes permisos para ver esta página
      </Typography>

      <CircularProgress color="error" />

      <Typography variant="body2" color="text.secondary" mt={2}>
        Serás redirigido en{" "}
        <Typography component="span" color="error" fontWeight="bold">
          {countdown}
        </Typography>{" "}
        segundos...
      </Typography>
    </Box>
  )
}
