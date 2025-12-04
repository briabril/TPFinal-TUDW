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
    set((state) => {
      console.log("⚡ RT NOTIFICATION RECEIVED:", notif);

      if (state.notifications.some((n) => n.id === notif.id)) {
        return state;
      }

      return {
        notifications: [notif, ...state.notifications],
        unread: state.unread + (notif.is_seen ? 0 : 1),
      };
    }),
  markAsSeen: (notif) =>
    set((state) => {
      const alreadySeen = state.notifications.find((n) => n.id === notif.id)?.is_seen;

      return {
        notifications: state.notifications.map((n) =>
          n.id === notif.id ? { ...n, is_seen: true } : n
        ),
        unread: alreadySeen ? state.unread : Math.max(0, state.unread - 1),
      };
    }),
}))
