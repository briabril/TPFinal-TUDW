"use client";

import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef } from "react";
import { LogOut } from "lucide-react";

export default function SidebarMobile({ items }: { items: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const theme = useTheme(); // 👈 USAMOS EL TEMA

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tapCount, setTapCount] = useState(0);

  const profileSize = 70;
  const longPressRef = useRef<any>(null);

  const isActive = (path?: string) => path && pathname.startsWith(path);

  const profilePath = `/${user?.username}`;

  const handleLongPress = (e: any) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handlePressStart = (e: any) => {
    longPressRef.current = setTimeout(() => handleLongPress(e), 600);
  };

  const handlePressEnd = () => {
    clearTimeout(longPressRef.current);
  };

  const handleProfileTap = () => {
    setTapCount((prev) => prev + 1);

    setTimeout(() => setTapCount(0), 350);

    if (tapCount >= 1) logout();
    else router.push(profilePath);
  };

  const renderItem = (item: any) => (
    <Box
      key={item.id}
      onClick={() => {
        if (item.path) router.push(item.path);
        if (item.onClick) item.onClick();
      }}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: isActive(item.path)
          ? theme.palette.primary.main
          : theme.palette.text.secondary,
        position: "relative",
        paddingY: 1,
        "&:active": { transform: "scale(0.92)" },
      }}
    >
      {item.badge ? (
        <Badge badgeContent={item.badge} max={9} color="primary">
          <item.icon size={25} />
        </Badge>
      ) : (
        <item.icon size={25} />
      )}

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive(item.path) ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: theme.palette.primary.main,
          marginTop: 4,
        }}
      />
    </Box>
  );

  const leftItems = items.slice(0, Math.floor(items.length / 2));
  const rightItems = items.slice(Math.floor(items.length / 2));

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.palette.background.paper,
        backdropFilter: "blur(12px)",
        borderTop: `1px solid ${theme.palette.divider}`,
        zIndex: 2000,
        px: 1,
      }}
    >
      <Box sx={{ flex: 1, display: "flex", justifyContent: "space-around" }}>
        {leftItems.map(renderItem)}
      </Box>

      <motion.div
        onClick={handleProfileTap}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onContextMenu={handleLongPress}
        animate={{
          scale: isActive(profilePath) ? 1.12 : 1,
          y: isActive(profilePath) ? -8 : 0,
        }}
        transition={{ type: "spring", stiffness: 240, damping: 17 }}
        style={{
          width: profileSize,
          height: profileSize,
          borderRadius: "50%",

          background: theme.palette.background.paper,

          boxShadow: isActive(profilePath)
            ? `0 0 12px ${theme.palette.primary.main}66`
            : theme.shadows[6],

          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          cursor: "pointer",
          transition: "box-shadow .25s ease",

          border: isActive(profilePath)
            ? `3px solid ${theme.palette.primary.main}`
            : "3px solid transparent",
        }}
      >
        <Avatar
          src={user?.profile_picture_url || undefined}
          sx={{ width: profileSize - 8, height: profileSize - 8 }}
        />

        <AnimatePresence>
          {isActive(profilePath) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 8 }}
              exit={{ opacity: 0, y: 4 }}
              style={{
                position: "absolute",
                bottom: -10,
                width: 36,
                height: 4,
                background: theme.palette.primary.main,
                borderRadius: 4,
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "space-around" }}>
        {rightItems.map(renderItem)}
      </Box>

      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => router.push(profilePath)}>
          Ver perfil
        </MenuItem>
        <MenuItem onClick={logout}>
          <LogOut size={18} style={{ marginRight: 8 }} /> Cerrar sesión
        </MenuItem>
      </Menu>
    </Box>
  );
}
