"use client";

import Link from "next/link";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Lock,
  Bell,
  Palette,
  History
} from "lucide-react";
export default function SettingsPanel() {
  const pathname = usePathname();
  const settingItems = [
    { text: "Cuenta", path: "/settings/account", icon: <User size={18} /> },
 
    { text: "Notificaciones", path: "/settings/notifications", icon: <Bell size={18} /> },
    { text: "Apariencia", path: "/settings/appearance", icon: <Palette size={18} /> },
    { text: "Tu actividad", path: "/settings/activity", icon: <History size={18} /> },
  ];
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
            color: active ? "primary.contrastText" : "text.primary",
            "&:hover": {
              backgroundColor: active ? "primary.dark" : "action.hover",
            },
          }}
        >
          <ListItemIcon
            sx={{ color: active ? "primary.contrastText" : "text.secondary", minWidth: 36 }}
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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid",
        borderColor: "divider",
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        p: 2,
        position: "sticky",
        top: 0,
      }}
    >
      <List>
        {renderList(settingItems)}
      </List>
    </Box>
  );
}

