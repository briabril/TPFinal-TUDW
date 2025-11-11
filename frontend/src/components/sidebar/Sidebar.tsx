"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@tpfinal/context";
import {
  Box,
  Button,
  Divider,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  Home,
  User,
  MessageSquare,
  Settings,
  PenSquare,
  LayoutDashboard,
  Users,
  Flag,
  LogOut,
} from "lucide-react";
import UserSearch from "../UserSearch";
import { fetchWeatherByCity } from "@/services/weatherService";

export default function Sidebar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) return <h1 className="text-center py-10 text-lg">Cargando...</h1>;

  const [weather, setWeather] = React.useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user?.city && user?.country_iso) {
          const w = await fetchWeatherByCity(user.city, user.country_iso);
          if (mounted) setWeather(w);
        }
      } catch (e) {
        console.warn('sidebar weather fetch failed', e);
      }
    })();
    return () => { mounted = false; };
  }, [user?.city, user?.country_iso]);

  // 🔹 Ítems del menú principal
  const navItems = [
    { icon: <Home size={18} />, text: "Inicio", path: "/feed" },
    { icon: <User size={18} />, text: "Perfil", path: `/${user?.username}` },
    { icon: <MessageSquare size={18} />, text: "Mensajes", path: "/messages" },
    { icon: <Settings size={18} />, text: "Configuración", path: "/settings" },
  ];

  // 🔹 Ítems de administrador
  const adminItems = [
    { icon: <LayoutDashboard size={18} />, text: "Panel Admin", path: "/admin/dashboard" },
    { icon: <Users size={18} />, text: "Gestión de usuarios", path: "/admin/users" },
    { icon: <Flag size={18} />, text: "Reportes", path: "/admin/reports" },
  ];

  // 🔹 Renderizado con estilo activo
  const renderList = (items: any[]) =>
    items.map(({ icon, text, path }) => {
  const basePath = typeof path === "string" ? path.split("#")[0] : path;
  const active = pathname === basePath;
      return (
        <ListItemButton
          key={path}
          component={Link}
          href={path}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            transition: "all 0.2s ease",
            backgroundColor: active ? "primary.main" : "transparent",
            color: active ? "#fff" : "text.primary",
            "&:hover": {
              backgroundColor: active
                ? "primary.dark"
                : "rgba(25,118,210,0.08)",
            },
          }}
        >
          <ListItemIcon
            sx={{ color: active ? "#fff" : "text.secondary", minWidth: 36 }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography fontWeight={active ? 600 : 500}>{text}</Typography>
            }
          />
        </ListItemButton>
      );
    });

  return (
    <Box
      sx={{
        width: 250,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #e0e0e0",
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        p: 2,
        position: "sticky",
        top: 0,
      }}
    >
      <div>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: "primary.main",
            textAlign: "center",
          }}
        >
          La Red
        </Typography>

        <Box sx={{ mb: 2 }}>
          <UserSearch />
        </Box>

        <List>{renderList(navItems)}</List>

        {user?.role === "ADMIN" && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                color: "text.secondary",
                ml: 2,
              }}
            >
              Admin
            </Typography>
            <List sx={{ mt: 1 }}>{renderList(adminItems)}</List>
          </>
        )}
      </div>

      {user && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "space-between",
            p: 1.5,
            borderRadius: 2,
          }}
        >
          
          {weather?.current && (
            <Box sx={{ mb: 1 }}>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                
                <Box sx={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 1, px: 0.8, py: 0.3 }}>
                  <Typography variant="caption" fontWeight={700}>
                    {Math.round(weather.current.temp)}° • {weather.current.weather?.[0]?.description}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={user.profile_picture_url ?? undefined}
                alt={user.displayname ?? user.username}
                sx={{ width: 36, height: 36 }}
              />
              <Box>
                <Typography fontWeight={600} lineHeight={1.1}>
                  {user.displayname}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{user.username}
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={logout}
              size="small"
              color="error"
              variant="text"
              sx={{ minWidth: 0 }}
            >
              <LogOut size={18} />
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
