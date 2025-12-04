"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, Badge, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";

interface Props {
  unread: number;
}

export default function FloatingNotificationBubble({ unread }: Props) {
  const router = useRouter();
  const theme = useTheme();
  const { darkMode } = useThemeContext();

  const elemRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  // Posición inicial
  const [pos, setPos] = useState({ x: 20, y: 140 });
  const [dragging, setDragging] = useState(false);

  const size = 60;
  const clickThreshold = 8; // px

  const handlePointerDown = (e: React.PointerEvent) => {
    // Sólo capturamos el primer pointer
    if (pointerIdRef.current !== null) return;

    const target = elemRef.current;
    if (!target) return;

    pointerIdRef.current = e.pointerId;
    startRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
    setDragging(true);

    // asegurar que recibimos los move/up
    try {
      target.setPointerCapture(e.pointerId);
    } catch (err) {
      // algunos navegadores pueden lanzar si no es posible; lo ignoramos
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // ignorar si no es el pointer que capturamos
    if (pointerIdRef.current !== e.pointerId) return;
    if (!dragging) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const distance = Math.hypot(dx, dy);

    if (distance > clickThreshold) {
      movedRef.current = true;
    }

    // actualizamos pos centrando la burbuja bajo el puntero
    setPos({
      x: e.clientX - size / 2,
      y: e.clientY - size / 2,
    });
  };

  const finishDrag = (clientX: number, clientY: number) => {
    setDragging(false);
    pointerIdRef.current = null;

    // snap a esquinas
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const snapX = pos.x < vw / 2 ? 20 : vw - size - 20;
    const snapY = Math.min(Math.max(pos.y, 20), vh - size - 20);

    setPos({ x: snapX, y: snapY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;

    const target = elemRef.current;
    if (target) {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    // si no se movió significativamente -> consideramos tap
    if (!movedRef.current) {
      router.push("/notifications");
      pointerIdRef.current = null;
      setDragging(false);
      return;
    }

    finishDrag(e.clientX, e.clientY);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const target = elemRef.current;
    if (target) {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    finishDrag(e.clientX, e.clientY);
  };

  const bg = theme.palette.background.paper;
  const bubbleShadow = theme.shadows[6];

  return (
    <AnimatePresence>
      <motion.div
        ref={elemRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 25 }}
        style={{
          position: "fixed",
          top: pos.y,
          left: pos.x,
          zIndex: 9999,
          width: size,
          height: size,
          borderRadius: "50%",
          touchAction: "none", // importante para pointer events y evitar scroll
          userSelect: "none",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: bubbleShadow,
            transition: dragging ? "none" : "transform 0.18s ease",
            cursor: dragging ? "grabbing" : "pointer",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Badge
            badgeContent={unread}
            color="error"
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: 11,
                fontWeight: "bold",
                minWidth: 22,
                height: 22,
                border: `2px solid ${bg}`,
                boxShadow: "0 0 4px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Bell size={28} color={theme.palette.text.primary} />
          </Badge>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
