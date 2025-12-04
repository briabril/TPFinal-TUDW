"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "@mui/material";

import Sidebar from "@/components/sidebar/Sidebar";
import SidebarMobile from "@/components/sidebar/SidebarMobile";
import SidebarPanel from "@/components/sidebar/SidebarPanel";
import FloatingNotificationBubble from "@/components/notifications/FloatingNotificationBubble";
import CenteredLoader from "@/components/CenterLoader";

// Iconos
import {
  Home,
  SearchIcon,
  Settings,
  MessageSquare,
  LayoutDashboard,
  Flag,
} from "lucide-react";

// Context y hooks
import { useAuth } from "@/context/AuthContext";
import { useNotificationsSocket } from "@/hooks/useNotificationsSocket";
import { useMessages } from "@/hooks/useMessages";
import { useNotificationStore } from "@/store/notificationStore";


export default function PrivateLayout({ children }: { children: ReactNode }) {
  
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { user, loading } = useAuth();
  const { unread: unreadMessages } = useMessages(user?.id || null);
  const { unread: unreadNotifications } = useNotificationStore();

  useNotificationsSocket();

  const [activePanel, setActivePanel] =
    useState<"none" | "search" | "settings" | "messages">("none");

  const pushAmount = activePanel === "settings" ? 250 : 0;

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
            {
              id: "messages",
              label: "Mensajes",
              icon: MessageSquare,
              path: "/messages",
              badge: unreadMessages > 0 ? unreadMessages : null,
            },
          ]
        : [],
    [user?.username, unreadMessages]
  );

  const adminItems = user
    ? [
        {
          id: "admin-dashboard",
          label: "Admin Panel",
          icon: LayoutDashboard,
          path: "/admin/dashboard",
          roles: ["ADMIN"],
        },
        {
          id: "admin-reports",
          label: "Reportes",
          icon: Flag,
          path: "/admin/reports",
          roles: ["ADMIN"],
        },
      ]
    : [];

  const visibleAdminItems = user
    ? adminItems.filter((item) => item.roles?.includes(user.role))
    : [];

  const itemsForMobile = [...mainNavItems, ...visibleAdminItems];

  if (loading) return <CenteredLoader />;
  if (!user) return null;


  return (
    <div className="flex relative min-h-screen w-full">
      {!isMobile && (
        <>
          <div
            className="z-20"
            style={{ position: "sticky", top: 0, height: "100vh" }}
          >
            <Sidebar userRole={user.role} />
          </div>

          <div className="z-10">
            <SidebarPanel activePanel={activePanel} />
          </div>
        </>
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
        <>
          {pathname !== "/notifications" && (
            <FloatingNotificationBubble unread={unreadNotifications} />
          )}

          <div className="fixed bottom-0 left-0 w-full z-30">
            <SidebarMobile items={itemsForMobile} />
          </div>
        </>
      )}

    </div>
  );
}
