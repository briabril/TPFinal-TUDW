"use client";

import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { Notification } from "@/types/notification";

type OnNotification = (notif: Notification) => void

export function useNotificationsSocket(onNotification: OnNotification) {
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (notif: Notification) => {
      onNotification(notif); 
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, [socketRef, onNotification]);
}