"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { User } from "@tpfinal/types";
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Panel de administración</h1>
      <UserTable users={users} onToggle={toggleUser} />
    </div>
  );
}
