import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import { useNotificationStore } from "@/store/notificationStore";
import { Notification } from "@/types/notification";

export function useNotificationsSocket() {
  const socketRef = useSocket();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const markAsSeen = useNotificationStore((s) => s.markAsSeen);

  const [socketReady, setSocketReady] = useState(false);

  // Detecta cuando el socket ya está conectado
  useEffect(() => {
    if (socketRef.current) {
      setSocketReady(true);
    }
  }, [socketRef.current]);

  // Este efecto se ejecuta recién CUANDO el socket está listo
  useEffect(() => {
    if (!socketReady || !socketRef.current) return;

    const socket = socketRef.current;

    const handleNotif = (notif: Notification) => {
      console.log("🔔 Nueva notificación:", notif);
      addNotification(notif);
    };

    const handleSeen = (notif: Notification) => {
      console.log("👁️ Vista:", notif);
      markAsSeen(notif);
    };

    socket.on("notification", handleNotif);
    socket.on("notification_seen", handleSeen);

    return () => {
      socket.off("notification", handleNotif);
      socket.off("notification_seen", handleSeen);
    };
  }, [socketReady]);
}
