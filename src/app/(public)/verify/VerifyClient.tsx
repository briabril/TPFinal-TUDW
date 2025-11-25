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
        const base = process.env.NEXT_PUBLIC_BACKEND_URL;
        const candidates = [
          { url: `${base}/api/auth/verify?token=${token}`, method: "GET" },
          { url: `${base}/auth/verify?token=${token}`, method: "GET" },
          { url: `${base}/api/auth/verify?token=${token}`, method: "POST" },
          { url: `${base}/auth/verify?token=${token}`, method: "POST" },
        ];

        let finalRes: Response | null = null;
        let finalData: any = null;

        for (const candidate of candidates) {
          try {
            const r = await fetch(candidate.url, { method: candidate.method, credentials: "include" });
            // Si el endpoint responde 404, probar siguiente candidato
            if (r.status === 404) continue;

            const ct = r.headers.get("content-type") || "";
            if (ct.includes("application/json")) finalData = await r.json();
            else finalData = await r.text();

            finalRes = r;
            break;
          } catch (e) {
            // si la petición falla (network), probar siguiente candidato
            // eslint-disable-next-line no-console
            console.warn("Intento de verify falló para", candidate.url, e);
            continue;
          }
        }

        if (!finalRes) {
          setStatus("error");
          return;
        }

        if (finalRes.ok) {
          setStatus("success");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          const msg = (finalData && (finalData.error || finalData.message)) || (typeof finalData === "string" ? finalData : null);
          if (typeof msg === "string" && msg.includes("ya usado")) {
            setStatus("success");
            setTimeout(() => router.push("/login"), 3000);
          } else {
            setStatus("error");
          }
        }
      } catch (err) {
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
