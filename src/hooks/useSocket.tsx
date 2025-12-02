import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import api from "@/api";

let globalSocket: Socket | null = null;

export function useSocket() {
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    if (globalSocket) {
      ref.current = globalSocket;
      return;
    }

    const setup = async () => {
      try {
        let token: string | undefined;

        try {
          const res = await api.get("/auth/socket-token", { withCredentials: true });
          token = res.data?.token;
        } catch {}

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        globalSocket = io(backendUrl!, {
          auth: token ? { token } : undefined,
          transports: ["websocket"]
        });

        ref.current = globalSocket;
      } catch (e) {
        console.error("Socket setup error", e);
      }
    };

    setup();
  }, []);

  return ref;
}
