"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import SidebarMobile from "@/components/sidebar/SidebarMobile";
import SidebarPanel from "@/components/sidebar/SidebarPanel";
import {
  Home,
  SearchIcon,
  Settings,
  MessageSquare,
  LayoutDashboard,
  Flag,
} from "lucide-react";
import CenteredLoader from "@/components/CenterLoader";
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
            { id: "home", label: "Inicio", icon: Home, path: "/feed" },
            { id: "search", label: "Buscar", icon: SearchIcon, path: "/search" },
            { id: "settings", label: "Configuración", icon: Settings, path: "/settings" },
            { id: "messages", label: "Mensajes", icon: MessageSquare, path: "/messages" },
          ]
        : [],
    [user?.username]
  );

  const adminItems = user
    ? [
        { id: "admin-dashboard", label: "Admin Panel", icon: LayoutDashboard, path: "/admin/dashboard", roles: ["ADMIN"] },
        { id: "admin-reports", label: "Reportes", icon: Flag, path: "/admin/reports", roles: ["ADMIN"] },
      ]
    : [];

  const visibleAdminItems = user ? adminItems.filter((it) => it.roles?.includes(user.role)) : [];
  const itemsForMobile = [...mainNavItems, ...visibleAdminItems];

if (loading) return <CenteredLoader />;


  if (!user) return null;

  return (
    <div className="flex relative min-h-screen w-full">

      {!isMobile && (
        <div className="z-20">
          <Sidebar userRole={user.role} />
        </div>
      )}

      {!isMobile && (
        <div className="z-10">
          <SidebarPanel activePanel={activePanel} />
        </div>
      )}
      <div
        className="flex-1 flex flex-col transition-all z-0"
        style={{
          marginLeft: !isMobile ? pushAmount : 0,
          transition: "margin-left .3s ease",
        }}
      >
        <main className="flex-1 pb-[60px] min-h-screen">{children}</main>
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full z-30">
          <SidebarMobile items={itemsForMobile} />
        </div>
      )}
    </div>
  );
}
