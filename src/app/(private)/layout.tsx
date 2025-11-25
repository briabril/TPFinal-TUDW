"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import SidebarMobile from "@/components/sidebar/SidebarMobile";
import SidebarPanel from "@/components/sidebar/SidebarPanel"
import { Home, SearchIcon, User, Settings, MessageSquare, LayoutDashboard, Flag } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography, useMediaQuery } from "@mui/material";
import type { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [activePanel, setActivePanel] = useState<"none" | "search" | "settings" | "messages">("none");

  const shouldPush = activePanel === "settings";
  const pushAmount = shouldPush ? 250 : 0;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const mainNavItems = useMemo(
    () =>
      user
        ? [
            { id: "home", label: "Inicio", icon: Home, path: "/feed", expandable: false },
            { id: "search", label: "Buscar", icon: SearchIcon, path: "/search", expandable: false, onClick: () => setActivePanel("search") },
            { id: "profile", label: "Perfil", icon: User, path: `/${user.username}`, expandable: false },
            { id: "settings", label: "Configuración", icon: Settings, path: "/settings", expandable: false, onClick: () => setActivePanel("settings") },
            { id: "messages", label: "Mensajes", icon: MessageSquare, path: "/messages", expandable: false, onClick: () => setActivePanel("messages") },
          ]
        : [],
    [user?.username]
  );

  const adminItems = user
    ? [
        { id: "admin-dashboard", label: "Admin Panel", icon: LayoutDashboard, path: "/admin/dashboard", roles: ["ADMIN"], expandable: false },
        { id: "admin-reports", label: "Reportes", icon: Flag, path: "/admin/reports", roles: ["ADMIN"], expandable: false },
      ]
    : [];

  const visibleAdminItems = user ? adminItems.filter((it) => it.roles?.includes(user.role)) : [];
  const itemsForMobile = [...mainNavItems, ...visibleAdminItems];

  if (loading)
    return (
      <Box className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="textSecondary">
          Cargando, por favor espera...
        </Typography>
      </Box>
    );

  if (!user) return null;

  return (
    <div className="flex relative">

      {!isMobile && <Sidebar userRole={user.role} />}
      <SidebarPanel activePanel={activePanel} />

      <div
        className="flex-1 flex flex-col transition-all"
        style={{
          marginLeft: shouldPush ? 250 : 0,
          transition: "margin-left .3s ease",
        }}
      >
        <main className="flex-1 pb-[60px]">{children}</main>
      </div>

      {isMobile && <SidebarMobile items={itemsForMobile} />}
    </div>
  );
}
