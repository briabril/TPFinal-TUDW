import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import api from "@/api";

let globalSocket: Socket | null = null;
export function useSocket() {
  const ref = useRef<Socket | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      if (globalSocket) {
        ref.current = globalSocket;
        setReady(true);
        return;
      }

      let token: string | undefined;
      try {
        const res = await api.get("/auth/socket-token", { withCredentials: true });
        token = res.data?.token;
      } catch (err) {
        console.warn("❌ No se pudo obtener token socket");
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
      
      globalSocket = io(backendUrl, {
        auth: { token },
        transports: ["websocket"],
      });

      globalSocket.on("connect", () => {
        setReady(true);
      });

      ref.current = globalSocket;
    };

    setup();
  }, []);

  return { socket: ref, ready };
}
