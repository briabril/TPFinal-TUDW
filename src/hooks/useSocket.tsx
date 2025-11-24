"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import api from "@/api";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [, setReadyTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      try {
        
        const envBackendPublic = process.env.NEXT_PUBLIC_BACKEND_URL;
        const envBackend = process.env.BACKEND_URL;
        const envApi = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
        let backendUrl: string | undefined = envBackendPublic || envBackend;
        if (!backendUrl && envApi) {
          try {
            backendUrl = new URL(envApi).origin;
          } catch (e) {
            // ignore
          }
        }
        if (!backendUrl && typeof window !== "undefined") {
          backendUrl = window.location.origin;
        }

        

        
        let token: string | undefined;
        try {
          const res = await api.get("/auth/socket-token", { withCredentials: true });
          token = res.data?.token;
        } catch (err) {
          
        }

        
        if (!backendUrl) {
          return;
        }

        const socket = io(backendUrl, {
          auth: token ? { token } : undefined,
          transports: ["websocket"],
        });

        socketRef.current = socket;
        setReadyTick((t) => t + 1);

        socket.on("connect", () => {
          console.debug("[useSocket] connected", socket.id);
        });
        socket.on("disconnect", (reason) => {
          console.debug("[useSocket] disconnected", reason);
        });
        socket.on("connect_error", (err) => {
          console.debug("[useSocket] connect_error", err?.message || err);
        });
      } catch (err) {
        console.debug("[useSocket] setup error", err);
      }
    };

    setup();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef;
}

export default useSocket;
