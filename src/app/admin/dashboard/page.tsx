"use client";

import { useEffect, useState, useMemo } from "react";
import api from "../../../api";
import { User } from "../../../types";
import ThemeToggle from "@/components/ThemeToggle";
import { Search, Users, UserCheck, UserX } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>("/admin/users", { withCredentials: true });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  async function toggleUser(id: string) {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`, {}, { withCredentials: true });
      const res = await api.get<User[]>("/admin/users", { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error("Error toggling user:", err);
    }
  }

  const total = users.length;
  const active = users.filter((u) => u.status === "ACTIVE").length;
  const suspended = total - active;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de administración</h1>
          <p className="text-sm text-gray-500">Gestión de usuarios del sistema</p>
        </div>
        <ThemeToggle />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <Metric icon={Users} label="Totales" value={total} />
        <Metric icon={UserCheck} label="Activos" value={active} />
        <Metric icon={UserX} label="Suspendidos" value={suspended} />
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        />
      </div>

      {/* RESPONSIVE LIST */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b dark:border-gray-700">
            <tr>
              <th className="py-2">Usuario</th>
              <th>Email</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b dark:border-gray-800">
                <td className="py-3">@{u.username}</td>
                <td>{u.email}</td>
                <td className={u.status === "ACTIVE" ? "text-green-600" : "text-red-500"}>
                  {u.status === "ACTIVE" ? "Activo" : "Suspendido"}
                </td>
                <td>
                  <button
                    onClick={() => toggleUser(u.id)}
                    className="text-blue-600 hover:underline"
                  >
                    {u.status === "ACTIVE" ? "Suspender" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-3 md:hidden">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
          >
            <p className="font-medium">@{u.username}</p>
            <p className="text-sm text-gray-500">{u.email}</p>
            <p
              className={`mt-1 text-sm ${
                u.status === "ACTIVE" ? "text-green-600" : "text-red-500"
              }`}
            >
              {u.status === "ACTIVE" ? "Activo" : "Suspendido"}
            </p>

            <button
              onClick={() => toggleUser(u.id)}
              className="mt-3 w-full py-2 rounded-md bg-blue-600 text-white text-sm font-medium"
            >
              {u.status === "ACTIVE" ? "Suspender" : "Reactivar"}
            </button>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <p className="text-center text-gray-500">No hay usuarios que coincidan con la búsqueda.</p>
      )}
    </div>
  );
}

/* SMALL REUSABLE METRIC COMPONENT */
function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center gap-1">
      <Icon className="w-5 h-5 text-gray-500" />
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
