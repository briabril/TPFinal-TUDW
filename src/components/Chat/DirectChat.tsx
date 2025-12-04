"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box, TextField, IconButton, List, ListItem, Typography, Avatar,
  useMediaQuery, useTheme, Paper
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useSocket } from "@/hooks/useSocket";
import api from "@/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";


type Props = {
  otherUserId: string;
  otherUserDisplay?: string;
  otherUserAvatar?: string;
};

export default function DirectChat({ otherUserId, otherUserDisplay, otherUserAvatar }: Props) {

  const theme = useTheme();
  const { socket, ready } = useSocket();  // <-- nuevo
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const listRef = useRef<HTMLUListElement | null>(null);
  let typingTimeout: any;

  const dedupeMessages = (arr: any[]) => {
    const seen = new Set<string>();
    return arr.filter((m) => {
      if (!m) return false;
      if (m.id) {
        if (seen.has(String(m.id))) return false;
        seen.add(String(m.id));
      }
      return true;
    });
  };

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ========================= SOCKET ==============================
  useEffect(() => {
    if (!ready || !socket.current || !user) return;

    const s = socket.current;

    const join = () => s.emit("join_dm", otherUserId);

    const msgHandler = (msg: any) => {
      setMessages((m) => {
        if (msg.id && m.some((ex) => ex.id === msg.id)) return m;

        if (msg.from === user.id) {
          const idx = m.findIndex(
            ex => ex.sending && ex.from === user.id && ex.text === msg.text
          );
          if (idx !== -1)
            return dedupeMessages(m.map((x, i) => i === idx ? msg : x));
        }
        return dedupeMessages([...m, msg]);
      });
    };

    const typingHandler = () => {
      setTyping(true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => setTyping(false), 1200);
    };

    s.on("connect", join);
    s.on("dm_message", msgHandler);
    s.on("typing", typingHandler);

    if (s.connected) join();

    return () => {
      s.emit("leave_dm", otherUserId);
      s.off("connect", join);
      s.off("dm_message", msgHandler);
      s.off("typing", typingHandler);
    };
  }, [ready, socket, user, otherUserId]);


  // ===================== Cargar historial al abrir ======================
  useEffect(() => {
    (async () => {
      const res = await api.get(`/messages/${otherUserId}`);
      setMessages(dedupeMessages(res.data.map((m: any) => ({ ...m, from: m.from || m.sender_id }))));
    })();
  }, [otherUserId]);


  // ===================== Marcar como visto ======================
  useEffect(() => {
    if (!ready || !socket.current || !user) return;

    socket.current.emit("dm_seen", { from: user.id, to: otherUserId });

    setMessages(prev =>
      prev.map(m => m.from !== user.id ? { ...m, read: true } : m)
    );
  }, [otherUserId, ready]);

  useEffect(() => {
    (async () => {
      const conv = await api.get("/messages/conversations");
      const find = conv.data.find((c: any) => c.otherUser.id === otherUserId);
      if (find) await api.post("/messages/mark-read", { conversationId: find.id });
    })();
  }, [otherUserId]);


  // Auto scroll
  useEffect(() => {
    const el = listRef.current;
    if (el) requestAnimationFrame(() => el.scrollTop = el.scrollHeight);
  }, [messages]);


  // ===================== Enviar mensaje ======================
  const send = async () => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    const tempId = "tmp-" + Date.now();

    const tempMsg = {
      id: tempId,
      from: user?.id, to: otherUserId,
      text: trimmed, created_at: new Date().toISOString(),
      sending: true, read: false
    };

    setMessages(m => [...m, tempMsg]);
    setText("");

    try {
      const res = await api.post("/messages", { to: otherUserId, text: trimmed });
      setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
    } catch { }
  };

  const handleTyping = () => {
    if (ready) socket.current?.emit("typing", { to: otherUserId });
  };

  const isNewDate = (i: number) => {
    if (i === 0) return true;
    return new Date(messages[i - 1].created_at).toDateString()
      !== new Date(messages[i].created_at).toDateString();
  };


  // =============================== UI =================================
  // =============================== UI =================================
  return (
    <Paper
      elevation={isMobile ? 0 : 2}
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        background: theme.palette.background.default,
      }}
    >
      <List
        ref={listRef}
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          background: theme.palette.background.default,
        }}
      >
        {messages.map((m, i) => {
          const mine = m.from === user?.id;

          return (
            <React.Fragment key={m.id}>
              {isNewDate(i) && (
                <Box sx={{ textAlign: "center", my: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      background: theme.palette.action.hover,
                      px: 1.2,
                      py: 0.35,
                      borderRadius: 2,
                      fontSize: "0.7rem",
                      opacity: 0.7,
                    }}
                  >
                    {new Date(m.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              <ListItem
                sx={{
                  display: "flex",
                  justifyContent: mine ? "flex-end" : "flex-start",
                  gap: mine ? 0 : 1,
                }}
              >
                {!mine && (
                  <Avatar
                    src={otherUserAvatar}
                    sx={{ width: 26, height: 26, alignSelf: "flex-end" }}
                  />
                )}

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.16 }}
                >
                  <Box
                    sx={{
                      maxWidth: isMobile ? "78%" : "58%",
                      background: mine
                        ? theme.palette.primary.main
                        : theme.palette.background.paper,
                      color: mine
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                      p: 1.3,
                      px: 1.6,
                      borderRadius: mine
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      boxShadow: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.4,
                      minWidth: "fit-content",
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "inherit",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.text}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: .6,
                        opacity: .75,
                      }}
                    >
                      <Typography sx={{ fontSize: "0.65rem" }}>
                        {formatMessageDate(m.created_at)}
                      </Typography>

                      {mine &&
                        (m.sending ? (
                          <Typography sx={{ fontSize: "0.6rem", opacity: .6 }}>…</Typography>
                        ) : m.read ? (
                          <DoneAllIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <DoneIcon sx={{ fontSize: 14 }} />
                        ))}
                    </Box>
                  </Box>
                </motion.div>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>

      <Box
        sx={{
          display: "flex",
          gap: 1.2,
          p: 1.4,
          borderTop: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
        }}
      >
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={4}
          value={text}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          placeholder="Escribe un mensaje"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              background: theme.palette.background.default,
              borderRadius: 2,
            },
          }}
        />

        <IconButton
          onClick={send}
          color="primary"
          sx={{
            borderRadius: 2,
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": { background: theme.palette.primary.dark },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

function formatMessageDate(i: string) {
  return new Date(i).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
