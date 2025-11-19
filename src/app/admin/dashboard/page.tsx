"use client";

import { useEffect, useState } from "react";
import api from "../../../api/index";
import { User } from "../../../types";
import ThemeToggle from "@/components/ThemeToggle";
import UserTable from "@/components/admin/UserTable";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>("/admin/users", {
          withCredentials: true,
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  async function toggleUser(id: string) {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`, {}, { withCredentials: true });
      const res = await api.get<User[]>("/admin/users", { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error("Error toggling user:", err);
    }
  }

  return (
    <div className="p-8 relative">
    
      <div className="absolute top-3 right-4"><ThemeToggle/></div>
      <h1 className="text-2xl font-bold mb-6">Panel de administración</h1>
      <UserTable users={users} onToggle={toggleUser} />
    </div>
  );
}
