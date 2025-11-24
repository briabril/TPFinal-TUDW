"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItemButton, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import UserSearch from "@/components/UserSearch";
import { useAuth } from "@/context/AuthContext";
import api from "@/api";
import DirectChat from "@/components/Chat/DirectChat";

export default function MessagesPage() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);


  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user) return;
      try {
        const [followRes, convRes] = await Promise.all([
          api.get(`/follow/${user.id}/following`, { withCredentials: true }),
          api.get(`/messages/conversations`, { withCredentials: true }),
        ]);
        console.debug("followRes:", followRes);
        console.debug("convRes:", convRes);
        setFollowing(followRes.data || []);
        setConversations(convRes.data || []);
      } catch (err) {
        console.error("Error fetching following:", err);
      }
    };
    fetchFollowing();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const handler = (e: any) => {
      const msg = e?.detail || e;
      if (!msg) return;
      //determinar el otro usuario en la conversación
      const sender = msg.from || msg.sender_id || msg.senderId;
      const recipient = msg.to || msg.toUserId;
      const otherId = String(sender) === String(user.id) ? String(recipient) : String(sender);

      setConversations((prev) => {
        let found = false;
        const updated = prev.map((c: any) => {
          if (String(c.otherUser?.id) === otherId) {
            found = true;
            return { ...c, lastMessage: { text: msg.text, created_at: msg.created_at, id: msg.id } };
          }
          return c;
        });
        if (found) return updated;

        // Si la conversación no existía, agregarla
        api.get(`/messages/conversations`, { withCredentials: true }).then((r) => {
          setConversations(r.data || []);
        }).catch(() => {});

        return prev;
      });
    };

    window.addEventListener('dm_message', handler as EventListener);
    return () => window.removeEventListener('dm_message', handler as EventListener);
  }, [user]);



  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, height: '100vh', flexDirection: 'row', flexWrap: 'nowrap' }}>
      <Box sx={{ width: { xs: 160, sm: 220, md: 320 }, minWidth: 140, maxWidth: 320, flexShrink: 0, overflow: 'auto' }}>
        <Typography variant="h6" component="h1">Mensajes</Typography>

        <Box sx={{ mt: 2 }}>
          <UserSearch showTitle onSelect={(u) => setSelected(u)} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1">Conversaciones</Typography>
          <List>
            {conversations.map((c: any) => (
              <ListItemButton key={c.otherUser.id} onClick={() => setSelected(c.otherUser)}>
                <ListItemAvatar>
                  <Avatar src={c.otherUser.profile_picture_url || undefined} />
                </ListItemAvatar>
                <ListItemText primary={c.otherUser.displayname || c.otherUser.username} secondary={c.lastMessage?.text} />
              </ListItemButton>
            ))}
            {conversations.length === 0 && (
              <Typography variant="body2" color="text.secondary">No tenés conversaciones todavía.</Typography>
            )}
          </List>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>A quienes seguís</Typography>
          <List>
            {following.map((f: any) => (
              <ListItemButton key={f.id} onClick={() => setSelected(f)}>
                <ListItemAvatar>
                  <Avatar src={f.profile_picture_url || undefined} />
                </ListItemAvatar>
                <ListItemText primary={f.displayname || f.username} secondary={f.username} />
              </ListItemButton>
            ))}
            {following.length === 0 && (
              <Typography variant="body2" color="text.secondary">No seguís a nadie todavía.</Typography>
            )}
          </List>
        </Box>
      </Box>

      <Box sx={{ flex: 1, height: '100%', minWidth: 0, minHeight: 0 }}>
        {selected ? (
          <DirectChat otherUserId={selected.id} otherUserDisplay={selected.displayname || selected.username} />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1">Seleccioná un usuario para iniciar el chat o buscá uno arriba.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
