// "use client";

// import { useState } from "react";
// import { Bell } from "lucide-react";
// import { useNotificationStore } from "@/store/notificationStore";

// export default function NotificationBell() {
//   const unread = useNotificationStore((s) => s.unread);
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen(!open)}
//         className="relative p-2 rounded-full hover:bg-gray-100 transition"
//       >
//         <Bell className="w-6 h-6 text-gray-700" />

//         {unread > 0 && (
//           <span
//             className="absolute -top-1 -right-1 bg-red-500 text-white 
//                        rounded-full text-xs px-1 animate-pulse"
//           >
//             {unread}
//           </span>
//         )}
//       </button>

//       {open && (
//         <div className="absolute right-0 mt-2 z-50">
//           <NotificationList />
//         </div>
//       )}
//     </div>
//   );
// }
