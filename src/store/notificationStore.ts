import { create } from "zustand";
import { Notification } from "@/types/notification";

interface NotificationState {
  notifications: Notification[];
  unread: number;

  setNotifications: (list: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  markAsSeen: (notif: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unread: 0,

  setNotifications: (list) =>
    set(() => ({
      notifications: list,
      unread: list.filter((n) => !n.is_seen).length,
    })),

  addNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unread: state.unread + 1,
    })),

  markAsSeen: (notif) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notif.id ? { ...n, is_seen: true } : n
      ),
      unread: Math.max(0, state.unread - (notif.is_seen ? 0 : 1)),
    })),
}));
