"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Badge,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UserSearch from "@/components/UserSearch";
import { useAuth } from "@/context/AuthContext";
import api from "@/api";
import DirectChat from "@/components/Chat/DirectChat";

export default function MessagesPage() {
  const { user } = useAuth();
  const theme = useTheme();

  const [following, setFollowing] = useState<any[]>([]);
  const [conversations, setConversations] = useState<
    { otherUser: any; lastMessage?: any; unreadCount?: number }[]
  >([]);
  const [selected, setSelected] = useState<any | null>(null);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /* ===========================
     1. Cargar data inicial
  ============================*/
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const [followRes, convRes] = await Promise.all([
          api.get(`/follow/${user.id}/following`, { withCredentials: true }),
          api.get(`/messages/conversations`, { withCredentials: true }),
        ]);

        // Aseguramos que cada conv tenga unreadCount
        const formatted = (convRes.data || []).map((c: any) => ({
          ...c,
          unreadCount: c.unreadCount ?? 0,
        }));

        setFollowing(followRes.data || []);
        setConversations(formatted);
      } catch (e) {}
    })();
  }, [user]);


  /* ==================================================
     2. Marcar como leído al abrir chat
  ==================================================*/
  useEffect(() => {
    if (!selected) return;

    api.post(
      "/messages/mark-read",
      { conversationId: selected.id },
      { withCredentials: true }
    ).catch(() => {});

    // Reset en UI
    setConversations(prev =>
      prev.map(c => c.otherUser.id === selected.id 
        ? { ...c, unreadCount: 0 }
        : c)
    );
  }, [selected]);


  /* ==================================================
     3. Escuchar realtime dm_message event
     Actualiza último mensaje, mueve conv a top y suma unread
  ==================================================*/
  useEffect(() => {
    if (!user) return;

    const handler = (e: any) => {
      const msg = e.detail;

      const sender = msg.from || msg.sender_id;
      const recipient = msg.to;
      const isMine = String(sender) === String(user.id);

      const otherId = isMine ? String(recipient) : String(sender);

      setConversations(prev => {
        let exists = false;

        const updated = prev.map(c => {
          if (String(c.otherUser.id) === otherId) {
            exists = true;
            return {
              ...c,
              lastMessage: msg,
              unreadCount:
                selected?.id === c.otherUser.id || isMine
                  ? 0
                  : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        });

        if (exists) {
          const moved = updated.find(c => c.otherUser.id === Number(otherId))!;
          return [moved, ...updated.filter(c => c.otherUser.id !== Number(otherId))];
        }

        return [
          {
            otherUser: { id: Number(otherId) },
            lastMessage: msg,
            unreadCount: isMine ? 0 : 1,
          },
          ...prev,
        ];
      });
    };

    window.addEventListener("dm_message", handler as EventListener);
    return () => window.removeEventListener("dm_message", handler as EventListener);
  }, [user, selected]);


  const showList = !isMobile || !selected;
  const showChat = !isMobile || selected;

  /* ==================================================
     UI
  ==================================================*/

  return (
    <Box sx={{
      display: "flex",
      height: { xs: "calc(100vh - 80px)", md: "100vh" },
      overflow: "hidden",
      background: theme.palette.background.default,
    }}>

      {/* ---------- LISTA DE CONVERSACIONES ---------- */}
      {showList && (
        <Paper elevation={3} sx={{
          width: { xs: "100%", md: 340 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: `1px solid ${theme.palette.divider}`,
        }}>

          <Box sx={{
            p: 2,
            fontWeight: "bold",
            fontSize: "1.15rem",
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            Mensajes
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            <UserSearch showTitle onSelect={(u) => setSelected(u)} />

            <Typography sx={{ mt: 3, mb: 1 }} variant="subtitle2" color="text.secondary">
              Conversaciones
            </Typography>

            <List>
              {conversations.map(c => (
                <ListItemButton
                  key={c.otherUser.id}
                  onClick={() => setSelected(c.otherUser)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="primary"
                      badgeContent={c.unreadCount}
                      invisible={!c.unreadCount}
                    >
                      <Avatar src={c.otherUser.profile_picture_url || undefined} />
                    </Badge>
                  </ListItemAvatar>

                  <ListItemText
                    primary={c.otherUser.displayname || c.otherUser.username}
                    secondary={c.lastMessage?.text || "Sin mensajes"}
                  />
                </ListItemButton>
              ))}

              {conversations.length === 0 && (
                <Typography mt={1} color="text.secondary">
                  No tenés conversaciones todavía.
                </Typography>
              )}
            </List>


            <Typography sx={{ mt: 3, mb: 1 }} variant="subtitle2" color="text.secondary">
              A quienes seguís
            </Typography>

            <List>
              {following.map(f => (
                <ListItemButton
                  key={f.id}
                  onClick={() => setSelected(f)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemAvatar>
                    <Avatar src={f.profile_picture_url || undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={f.displayname || f.username}
                    secondary={`@${f.username}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Paper>
      )}


      {showChat && (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {selected && (
            <Box sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              position: "sticky", top: 0, zIndex: 5
            }}>
              {isMobile && (
                <IconButton onClick={() => setSelected(null)}>
                  <ArrowBackIcon />
                </IconButton>
              )}

              <Avatar src={selected.profile_picture_url || undefined} />
              <Box>
                <Typography fontWeight={600}>
                  {selected.displayname || selected.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{selected.username}
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {selected ? (
              <DirectChat
                otherUserId={selected.id}
                otherUserDisplay={selected.displayname || selected.username}
                otherUserAvatar={selected.profile_picture_url}
              />
            ) : (
              <Box sx={{ height:"100%", display:"flex", justifyContent:"center", alignItems:"center" }}>
                <Typography color="text.secondary">
                  Seleccioná un chat para empezar.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
