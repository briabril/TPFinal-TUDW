import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationList from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  return (
    <div className="p-10 space-y-6">
      <NotificationBell />

      <NotificationList />
    </div>
  );
}
