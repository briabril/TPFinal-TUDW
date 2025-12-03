import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import api from "@/api";

let globalSocket: Socket | null = null;

export function useSocket(): React.MutableRefObject<Socket | null> {
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    const setup = async () => {
      if (globalSocket) {
        ref.current = globalSocket;
        return;
      }

      let token: string | undefined = undefined;
      try {
        const res = await api.get("/auth/socket-token", { withCredentials: true });
        token = res.data?.token;
      } catch (err) {
        console.warn("❌ No se pudo obtener el token de socket:", err);
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
      
      globalSocket = io(backendUrl, {
        auth: token ? { token } : undefined,
        transports: ["websocket"],
      });

      globalSocket.on("connect", () => {
        console.log("✅ SOCKET CONECTADO:", globalSocket?.id);
      });

      globalSocket.on("connect_error", (err) => {
        console.log("❌ ERROR DE CONEXIÓN SOCKET:", err);
      });

      globalSocket.on("disconnect", () => {
        console.log("⚠️ SOCKET DESCONECTADO");
      });

      ref.current = globalSocket;
    };

    setup();
  }, []);

  return ref;
}
