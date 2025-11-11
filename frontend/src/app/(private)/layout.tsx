"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import { useAuth } from "@tpfinal/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);
  
  if (loading) return (
    <Box className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" color="textSecondary">
        Cargando, por favor espera...
      </Typography>
    </Box>
  );

  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
