"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyClient() {
  const search = useSearchParams();
  const token = search.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const router = useRouter();

  useEffect(() => {
    if (!token || status !== "idle") return;
    setStatus("loading");

    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify?token=${token}`, {
  method: "POST",
  credentials: "include",
});

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          if (data?.error?.includes("ya usado")) {
            setStatus("success");
            setTimeout(() => router.push("/login"), 3000);
          } else {
            setStatus("error");
          }
        }
      } catch (err) {
        console.error("Error en verificación:", err);
        setStatus("error");
      }
    })();
  }, [token, router, status]);

  return (
    <div className="p-8 text-center">
      {status === "idle" && <p>Esperando token...</p>}
      {status === "loading" && <p>Verificando tu cuenta...</p>}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold mb-4">Cuenta activada</h1>
          <p>Redirigiendo a login...</p>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold mb-4">Verificación inválida</h1>
          <p>El token no es válido, expiró o ya fue usado.</p>
        </>
      )}
    </div>
  );
}
