"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import SidebarMobile from "@/components/sidebar/SidebarMobile";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { useMediaQuery } from "@mui/material";
import { LayoutDashboard, Flag } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (loading) return <p>Cargando...</p>;
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/unauthorized");

  const adminItems = [
    { id: "admin-dashboard", label: "Panel", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "admin-reports", label: "Reportes", icon: Flag, path: "/admin/reports" },
  ];

  return (
    <div className="flex relative">
      {!isMobile && <Sidebar userRole={user.role} />}

      <main className="flex-1 p-6 pb-[70px]">
        {children}
      </main>

      {isMobile && <SidebarMobile items={adminItems} />}
    </div>
  );
}
