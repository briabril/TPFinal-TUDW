"use client";

import { useNotificationStore } from "@/store/notificationStore";
import { useEffect, useState } from "react";
import api from "@/api";
import Link from "next/link";

import {
  MessageSquare,
  ThumbsUp,
  UserPlus,
  MessageCircleWarning,
  Bell,
} from "lucide-react";

import {
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Box,
  Divider,
  Tabs,
  Tab,
  Badge,
  Button,
  useTheme,
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext } from "@/context/ThemeContext";
import { Notification } from "@/types/notification";

export default function NotificationsPage() {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useThemeContext();

  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markAsSeen = useNotificationStore((s) => s.markAsSeen);

  const [tab, setTab] = useState("all");

  // ================================
  // 1) CARGA INICIAL DESDE BACKEND
  // ================================
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data);
      } catch (err) {
        console.error("Error loading notifications", err);
      }
    };

    loadNotifications();
  }, [setNotifications]);

  // =====================================
  // 2) MARCAR NOTIFICACIÓN INDIVIDUAL
  // =====================================
  const handleClick = async (notif: Notification) => {
    if (notif.is_seen) return;

    markAsSeen(notif); // actualización instantánea en UI

    try {
      await api.put("/notifications/mark-seen", {
        ids: [notif.id],
      });
    } catch (err) {
      console.error("Error marking notification", err);
    }
  };

  const markAll = async () => {
    const unseen = notifications.filter((n) => !n.is_seen);
    unseen.forEach((n) => markAsSeen(n));

    try {
      await api.put("/notifications/mark-seen", {
        ids: unseen.map((n) => n.id),
      });
    } catch (err) {
      console.error("Error marking all notifications", err);
    }
  };

  const filters: Record<string, string[]> = {
    all: [],
    likes: ["LIKE_POST", "LIKE_COMMENT"],
    comments: ["COMMENT"],
    follows: ["FOLLOW"],
    messages: ["MESSAGE"],
  };

  const filtered =
    tab === "all"
      ? notifications
      : notifications.filter((n) => filters[tab].includes(n.type));

  const countByType = (types: string[]) =>
    notifications.filter((n) => types.includes(n.type) && !n.is_seen).length;


  const unreadCount = notifications.filter((n) => !n.is_seen).length;

  const getIcon = (type: string) => {
    const size = 22;
    switch (type) {
      case "LIKE_POST":
      case "LIKE_COMMENT":
        return <ThumbsUp size={size} color={theme.palette.primary.main} />;
      case "COMMENT":
        return <MessageSquare size={size} color={theme.palette.success.main} />;
      case "FOLLOW":
        return <UserPlus size={size} color={theme.palette.secondary.main} />;
      case "MESSAGE":
        return (
          <MessageCircleWarning
            size={size}
            color={theme.palette.warning.main}
          />
        );
      default:
        return <Bell size={size} color={theme.palette.text.secondary} />;
    }
  };
  return (
    <Box display="flex" justifyContent="center" px={2} py={4}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 800,
          p: 3,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="600">
              Notificaciones
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unreadCount}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontWeight: 600 }}
                >
                  {unreadCount}
                </motion.span>
              </AnimatePresence>{" "}
              sin leer
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button size="small" onClick={toggleDarkMode}>
              {darkMode ? "Light" : "Dark"}
            </Button>

            <Button size="small" variant="outlined" onClick={markAll}>
              Marcar todo
            </Button>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            "& .MuiTab-root": { flex: 1, fontWeight: 500 },
          }}
          variant="fullWidth"
        >
          <Tab
            value="all"
            label={
              unreadCount > 0
                ? <Badge color="primary" badgeContent={unreadCount}>Todos</Badge>
                : "Todos"
            }
          />

          <Tab
            value="likes"
            label={
              countByType(["LIKE_POST", "LIKE_COMMENT"]) > 0
                ? <Badge color="primary" badgeContent={countByType(["LIKE_POST", "LIKE_COMMENT"])}>Likes</Badge>
                : "Likes"
            }
          />

          <Tab
            value="comments"
            label={
              countByType(["COMMENT"]) > 0
                ? <Badge color="success" badgeContent={countByType(["COMMENT"])}>Comentarios</Badge>
                : "Comentarios"
            }
          />

          <Tab
            value="follows"
            label={
              countByType(["FOLLOW"]) > 0
                ? <Badge color="secondary" badgeContent={countByType(["FOLLOW"])}>Follows</Badge>
                : "Follows"
            }
          />
        </Tabs>
        <List sx={{ width: "100%" }}>
          {filtered.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={6}
              gap={2}
            >
              <img
                src={darkMode ? "/cat_darkmode.png" : "/cat_lightmode.png"}
                alt="No hay notificaciones"
                style={{ width: 230, opacity: 0.9 }}
              />

              <Typography variant="body1" color="text.secondary">
                No hay notificaciones
              </Typography>
            </Box>
          ) : (
            <AnimatePresence>
              {filtered.map((n, index) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    onClick={() => handleClick(n)}
                    sx={{
                      py: 1.5,
                      borderRadius: 1.5,
                      transition: "0.25s",
                      bgcolor: n.is_seen ? "transparent" : theme.palette.action.hover,
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                        transform: "scale(0.995)",
                      },
                    }}
                  >
                    <Box mr={2} display="flex" alignItems="center" sx={{ opacity: 0.9 }}>
                      {getIcon(n.type)}
                    </Box>

                    <ListItemAvatar>
                      <Link href={`/${n.sender.username}`}>
                        <Avatar
                          src={n.sender.profile_picture_url ?? ""}
                          sx={{ cursor: "pointer", borderRadius: "50%" }}
                        />
                      </Link>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>{n.sender.username}</Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">{n.message}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(n.created_at).toLocaleString("es-AR", {
                              dateStyle: "short",
                              timeStyle: "short",
                              timeZone: "America/Argentina/Buenos_Aires",
                            })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>

                  {index < filtered.length - 1 && (
                    <Divider sx={{ my: 1.5, opacity: 0.4 }} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </List>
      </Box>
    </Box>
  );
}
