import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import { useNotificationStore } from "@/store/notificationStore";
import { Notification } from "@/types/notification";

export function useNotificationsSocket() {
  const { socket, ready } = useSocket()
  const addNotification = useNotificationStore(s => s.addNotification);
  const markAsSeen = useNotificationStore(s => s.markAsSeen);
  useEffect(() => {
    if (!ready) return
    const s = socket.current
    if (!s) return
    
    s.off("notification");
    s.off("notification_seen");

    s.on("notification", (notif: Notification) => {
      console.log("Nueva notificación:", notif);
      addNotification(notif);
    });

    s.on("notification_seen", (notif: Notification) => {
      console.log("Vista:", notif);
      markAsSeen(notif);
    });

    return () => {
      s.off("notification");
      s.off("notification_seen");
    };
  }, [ready]);
}
