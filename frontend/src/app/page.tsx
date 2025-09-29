// frontend/src/app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function PublicHome() {
  return (
    <div className="text-center">
      <h1>Bienvenido a la red social</h1>
      <div className="flex gap-4 mt-4 justify-center">
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Crear Cuenta
        </Link>
      </div>
    </div>
  );
}

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (user.role === "ADMIN") {
        router.replace("/dashboard");
      } else {
        router.replace("/feed");
      }
    }
  }, [user, loading, router]);

  if (loading) return <p>Cargando...</p>;

  if (!user) {
    return <PublicHome />;
  }

  return <p>Redirigiendo...</p>;
}
