"use client";
import React, { useEffect, useState, useRef } from "react";
import { Box, TextField, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import useSocket from "@/hooks/useSocket";
import api from "@tpfinal/api";
import { useAuth } from "@/context/AuthContext";

type Props = {
  otherUserId: string;
  otherUserDisplay?: string;
};

export default function DirectChat({ otherUserId, otherUserDisplay }: Props) {
  const socketRef = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<any>>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!user) return;

    const onConnect = () => {
      const s = socketRef.current;
      if (s) s.emit("join_dm", otherUserId);
    };

    const handler = (msg: any) => {
      setMessages((m) => {
        if (msg.id && m.some((ex) => ex.id === msg.id)) return m;
        if (!msg.id && m.some((ex) => ex.text === msg.text && ex.from === msg.from && ex.created_at === msg.created_at)) return m;
        return [...m, msg];
      });
    };

    if (socket) {
      socket.on("connect", onConnect);
      socket.on("dm_message", handler);
      if (socket.connected) socket.emit("join_dm", otherUserId);
    }

    return () => {
      if (socket) {
        socket.off("connect", onConnect);
        socket.off("dm_message", handler);
      }
    };
  }, [socketRef.current, otherUserId, user]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/messages/${otherUserId}`);
        const data = res.data || [];
        const normalized = (data || []).map((m: any) => ({ ...m, from: m.from || m.sender_id }));
        setMessages(normalized);
      } catch (err) {
        console.error("Error fetching message history", err);
      }
    };
    fetchHistory();
  }, [otherUserId]);

  useEffect(() => {
    const el = listRef.current as any;
    if (!el) return;
    requestAnimationFrame(() => {
      try {
        el.scrollTop = el.scrollHeight;
      } catch (_) {}
    });
  }, [messages]);

  const send = () => {
    const socket = socketRef.current;
    if (!socket || !text.trim()) return;
    const trimmed = text.trim();
    const tempId = `temp-${Date.now()}`;
    socket.emit("dm_message", { to: otherUserId, text: trimmed });  
    setMessages((m) => [...m, { id: tempId, from: user?.id, to: otherUserId, text: trimmed, created_at: new Date().toISOString() }]);
    setText("");
  };

  return (
    <Box sx={{ width: '100%', height: '100%', border: "1px solid #ddd", borderRadius: 2, p: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>{otherUserDisplay || otherUserId}</Typography>
      <List ref={listRef as any} sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        {messages.map((m, i) => (
          <ListItem key={i} sx={{ justifyContent: m.from === user?.id ? 'flex-end' : 'flex-start' }}>
            <ListItemText primary={m.text} secondary={m.from === user?.id ? 'Tú' : otherUserDisplay || m.from} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField fullWidth size="small" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje" />
        <IconButton onClick={send} color="primary"><SendIcon /></IconButton>
      </Box>
    </Box>
  );
}
