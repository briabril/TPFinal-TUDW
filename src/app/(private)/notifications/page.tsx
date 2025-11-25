"use client";

import { useState } from "react";
import { useNotificationsSocket } from "@/hooks/useNotificationsSocket";
import { Notification } from "@/types/notification";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useNotificationsSocket((notif) => {
    setNotifications((prev) => [notif, ...prev]);
  });

  return (
    <div>
      <h2>Notificaciones</h2>

      {notifications.length === 0 && <p>No hay notificaciones aún.</p>}

      {notifications.map((n) => (
        <div key={n.id} className="border p-2 rounded">
          {n.type} — {n.actor?.username}
        </div>
      ))}
    </div>
  );
}
