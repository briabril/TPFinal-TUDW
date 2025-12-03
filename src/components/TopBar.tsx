"use client";

import NotificationBell from "./notifications/NotificationBell";

export default function TopBar() {
  return (
    <div className="w-full h-14 border-b flex items-center justify-end px-4 bg-white sticky top-0 z-50">
      <NotificationBell />
    </div>
  );
}
