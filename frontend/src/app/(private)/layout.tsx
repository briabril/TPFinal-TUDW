"use client";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserSearch from "@/components/UserSearch";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) return <p>Cargando...</p>;
  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex justify-end">
          <div className="w-auto h-auto m-3">
            <UserSearch />
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
