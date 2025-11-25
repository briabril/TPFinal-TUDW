"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Box, Button, Avatar, Typography } from "@mui/material";
import getImageUrl from "@/utils/getImageUrl";
import {
  Home,
  User,
  MessageSquare,
  Settings,
  SearchIcon,
  LayoutDashboard,
  BellDotIcon,
  Compass,
  Flag,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { SidebarItem } from "./SidebarItem";
import { NavItem } from "@/types/nav_item";
import { fetchWeatherByCity } from "@/services/weatherService";
import SidebarPanel from "./SidebarPanel";

export default function Sidebar({ userRole = "USER" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const [activeItem, setActiveItem] = useState("home");
  const [isExpanded, setIsExpanded] = useState<boolean | null>(null);
  const [weather, setWeather] = useState<any | null>(null);

  const [activePanel, setActivePanel] =
    useState<"none" | "messages" | "search" | "settings">("none");

  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-expanded");
      if (saved !== null) {
        setIsExpanded(saved === "true");
      } else {
        setIsExpanded(true);
      }
    } catch {
      setIsExpanded(true);
    }
  }, []);

  useEffect(() => {
    if (isExpanded === null) return;
    try {
      localStorage.setItem("sidebar-expanded", String(isExpanded));
    } catch {}
  }, [isExpanded]);

  const mainNavItems: NavItem[] = [
    { id: "home", label: "Inicio", icon: Home, path: "/feed", expandable: true },
    { id: "profile", label: "Perfil", icon: User, path: `/${user?.username}`, expandable: true },
    { id: "search", label: "Buscar", icon: SearchIcon, expandable: false },
    { id: "notifications", label: "Notificaciones", icon: BellDotIcon, path: '/notifications', expandable: true },
    { id: "settings", label: "Configuración", icon: Settings, path: "/settings", expandable: true },
    { id: "messages", label: "Mensajes", icon: MessageSquare, path: "/messages", expandable: true },
  ];

  // Admin
  const adminItems: NavItem[] = [
    { id: "admin-dashboard", label: "Admin Panel", icon: LayoutDashboard, roles: ["ADMIN"], path: "/admin/dashboard", expandable: true },
    { id: "admin-reports", label: "Reportes", icon: Flag, roles: ["ADMIN"], path: "/admin/reports", expandable: true },
  ];

  const visibleAdminItems = adminItems.filter((it) => it.roles?.includes(userRole));

  useEffect(() => {
    const current = mainNavItems.find((item) => item.path && pathname.startsWith(item.path));
    if (current) setActiveItem(current.id);
  }, [pathname]);

  // Weather
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user?.city && user?.country_iso) {
          const w = await fetchWeatherByCity(user.city, user.country_iso);
          if (mounted) setWeather(w);
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [user?.city, user?.country_iso]);

  const handleItemClick = (item: NavItem) => {
    setActiveItem(item.id);

    if (item.expandable) {
      setIsExpanded(true);
      setActivePanel("none");
      if (item.path) router.push(item.path);
    } else {
      setIsExpanded(false);
      setActivePanel(item.id as any);
    }
  };

  const sidebarVariants = {
    expanded: { width: 250 },
    collapsed: { width: 70 },
  };

  if (isExpanded === null) return null;

  return (
    <nav style={{ position: "relative" }}>
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={isExpanded ? "expanded" : "collapsed"}
        className="h-screen flex flex-col border-r-0"
        style={{
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          padding: 8,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <img src="/logo.png" alt="Bloop" style={{ width: 130 }} />
        </Box>

        <motion.nav className="flex-1 overflow-y-auto px-1 space-y-2">
          {mainNavItems.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeItem === item.id}
              isExpanded={isExpanded}
              onClick={() => handleItemClick(item)}
            />
          ))}

          {visibleAdminItems.length > 0 && isExpanded && (
            <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mt-4">
              Admin
            </p>
          )}

          {visibleAdminItems.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeItem === item.id}
              isExpanded={isExpanded}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </motion.nav>

        {user && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              mt: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            {isExpanded && weather?.current && (
              <Box sx={{ mb: 1, textAlign: "center" }}>
                <Typography variant="caption" fontWeight={700}>
                  {Math.round(weather.current.temp)}° • {weather.current.weather?.[0]?.description}
                </Typography>
              </Box>
            )}

            {isExpanded ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={getImageUrl(user.profile_picture_url) || undefined}
                    alt={user.displayname ?? user.username}
                    sx={{ width: 36, height: 36 }}
                  />
                  <Box>
                    <Typography fontWeight={600}>{user.displayname}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{user.username}
                    </Typography>
                  </Box>
                </Box>

                <Button onClick={logout} size="small" color="error">
                  <LogOut size={18} />
                </Button>
              </Box>
            ) : (
              <>
                <Avatar
                  src={getImageUrl(user.profile_picture_url) || undefined}
                  alt={user.displayname ?? user.username}
                  sx={{ width: 36, height: 36 }}
                />

                <Button
                  onClick={logout}
                  size="small"
                  color="error"
                  sx={{ minWidth: 0, p: 0.5, borderRadius: "50%" }}
                >
                  <LogOut size={18} />
                </Button>
              </>
            )}
          </Box>
        )}
      </motion.div>

      {activePanel !== "none" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setActivePanel("none")}
          style={{
            position: "fixed",
            top: 0,
            left: isExpanded ? 250 : 70, 
            width: `calc(100vw - ${isExpanded ? 250 : 70}px)`,
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1500,
          }}
        />
      )}
      {!isExpanded && (
        <SidebarPanel activePanel={activePanel} onClose={() => setActivePanel("none")} />
      )}
    </nav>
  );
}
