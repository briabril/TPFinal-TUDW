"use client";

import { useNotificationStore } from "@/store/notificationStore";
import Link from "next/link";
import { MessageSquare, ThumbsUp, UserPlus, MessageCircleWarning, Bell } from "lucide-react";
import { Avatar } from "@mui/material";
export default function NotificationList() {
  const notifications = useNotificationStore((s) => s.notifications);

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE_POST": return <ThumbsUp className="text-blue-500 w-4 h-4" />;
      case "LIKE_COMMENT": return <ThumbsUp className="text-blue-500 w-4 h-4" />;
      case "COMMENT": return <MessageSquare className="text-green-500 w-4 h-4" />;
      case "FOLLOW": return <UserPlus className="text-purple-500 w-4 h-4" />;
      case "MESSAGE": return <MessageCircleWarning className="text-yellow-500 w-4 h-4" />;
      case "REPORT": return <MessageCircleWarning className="text-red-500 w-4 h-4" />;
      default: return <Bell className="text-gray-500 w-4 h-4" />;
    }
  };

  console.log("Notificaciones: ", notifications)

  return (
    <div className="w-80 bg-white shadow-lg rounded-xl border p-3">
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">Notificaciones 🔔</h3>

      {notifications.length === 0 && (
        <p className="text-gray-500 text-sm">No tienes notificaciones.</p>
      )}

      <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`flex items-start gap-2 p-2 rounded-md border-l-4 transition 
                        ${n.is_seen ? "border-gray-300 opacity-70" : "border-blue-500 bg-blue-50"}`}
          >
            {getIcon(n.type)}

            <div>

              <Link href={`/${n.sender_username}`}>
                <Avatar src={n.avatar_sender_username} />
              </Link>
              <p className="font-medium">{n.sender_username}</p>
              <p className="font-medium">{n.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
