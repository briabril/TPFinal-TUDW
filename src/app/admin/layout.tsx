"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import SidebarMobile from "@/components/sidebar/SidebarMobile";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { useMediaQuery } from "@mui/material";
import { LayoutDashboard, Flag, Home, Search as SearchIcon, Settings, MessageSquare } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { unread: unreadMessages } = useMessages(user?.id || null);

  if (loading) return <p>Cargando...</p>;
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/unauthorized");

  const adminItems = [
    { id: "admin-dashboard", label: "Panel", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "admin-reports", label: "Reportes", icon: Flag, path: "/admin/reports" },
  ];


  const mainNavItems = [
    { id: "home", label: "Inicio", icon: Home, path: "/feed" },
    { id: "search", label: "Buscar", icon: SearchIcon, path: "/search" },
    { id: "settings", label: "Configuración", icon: Settings, path: "/settings" },
    { id: "messages", label: "Mensajes", icon: MessageSquare, path: "/messages", badge: unreadMessages > 0 ? unreadMessages : null },
  ];

  const itemsForMobile = [...mainNavItems, ...adminItems];

  return (
    <div className="flex relative">
      {!isMobile && <Sidebar userRole={user.role} />}

      <main className="flex-1 p-6 pb-[70px]">
        {children}
      </main>

      {isMobile && <SidebarMobile items={itemsForMobile} />}
    </div>
  );
}
