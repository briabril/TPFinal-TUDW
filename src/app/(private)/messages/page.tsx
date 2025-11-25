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
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  // treat md as breakpoint for mobile/tablet
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [followRes, convRes] = await Promise.all([
          api.get(`/follow/${user.id}/following`, { withCredentials: true }),
          api.get(`/messages/conversations`, { withCredentials: true }),
        ]);
        setFollowing(followRes.data || []);
        setConversations(convRes.data || []);
      } catch {}
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handler = (e: any) => {
      const msg = e?.detail || e;
      if (!msg) return;

      const sender = msg.from || msg.sender_id;
      const recipient = msg.to;
      const otherId =
        String(sender) === String(user.id) ? String(recipient) : String(sender);

      setConversations((prev) => {
        let found = false;
        const updated = prev.map((c: any) => {
          if (String(c.otherUser?.id) === otherId) {
            found = true;
            return { ...c, lastMessage: msg };
          }
          return c;
        });

        if (found) return updated;
        return prev;
      });
    };

    window.addEventListener("dm_message", handler as EventListener);

    return () => window.removeEventListener("dm_message", handler as EventListener);
  }, [user]);

  const showList = !isMobile || !selected;
  const showChat = !isMobile || selected;

  return (
    <Box
      sx={{
        display: "flex",
        height: { xs: "calc(100vh - 80px)", md: "100vh" },
        overflow: "hidden",
        background: theme.palette.background.default,
      }}
    >
      {showList && (
        <Paper
          elevation={3}
          sx={{
            width: { xs: "100%", md: 340 },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            sx={{
              p: 2,
              position: "sticky",
              top: 0,
              zIndex: 9,
              fontWeight: "bold",
              fontSize: "1.1rem",
              background: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            Mensajes
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            <UserSearch showTitle onSelect={(u) => setSelected(u)} />

            <Typography
              variant="subtitle2"
              sx={{ mt: 3, mb: 1, color: theme.palette.text.secondary }}
            >
              Conversaciones
            </Typography>

            <List>
              {conversations.map((c: any) => (
                <ListItemButton
                  key={c.otherUser.id}
                  onClick={() => setSelected(c.otherUser)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    "&:hover": {
                      background: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={c.otherUser.profile_picture_url || undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={c.otherUser.displayname || c.otherUser.username}
                    secondary={c.lastMessage?.text}
                  />
                </ListItemButton>
              ))}

              {conversations.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tenés conversaciones todavía.
                </Typography>
              )}
            </List>

            <Typography
              variant="subtitle2"
              sx={{ mt: 3, mb: 1, color: theme.palette.text.secondary }}
            >
              A quienes seguís
            </Typography>

            <List>
              {following.map((f: any) => (
                <ListItemButton
                  key={f.id}
                  onClick={() => setSelected(f)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    "&:hover": {
                      background: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={f.profile_picture_url || undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={f.displayname || f.username}
                    secondary={f.username}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Paper>
      )}
      {showChat && (
        <Box
          sx={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            background: theme.palette.background.default,
          }}
        >
          {selected && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: { xs: 1, md: 2 },
                borderBottom: `1px solid ${theme.palette.divider}`,
                position: "sticky",
                top: 0,
                zIndex: 2200, // alto para evitar overlay del SidebarMobile
                background: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
              }}
            >
              {isMobile && (
                <IconButton
                  onClick={() => setSelected(null)}
                  sx={{
                    borderRadius: 1,
                    bgcolor: theme.palette.background.default,
                    "&:hover": { bgcolor: theme.palette.action.hover },
                  }}
                  aria-label="Volver"
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Avatar
                src={selected.profile_picture_url || undefined}
                sx={{ width: 40, height: 40 }}
              />
              <Box>
                <Typography sx={{ fontWeight: 600 }}>
                  {selected.displayname || selected.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selected.username ? `@${selected.username}` : ""}
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
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.palette.text.secondary,
                }}
              >
                <Typography>Seleccioná un usuario para chatear.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
