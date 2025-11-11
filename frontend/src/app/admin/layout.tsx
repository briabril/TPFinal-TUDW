"use client"
// Sidebar component lives under src/components/sidebar/Sidebar.tsx
import Sidebar from "@/components/sidebar/Sidebar"
import { useAuth } from "@tpfinal/context"
import { redirect } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <p>Cargando...</p>
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/unauthorized")

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
