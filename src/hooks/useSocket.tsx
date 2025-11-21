"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import api from "@/api";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

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

        socket.on("connect", () => {});
        socket.on("disconnect", () => {});
        socket.on("connect_error", () => {});
      } catch (err) {
        
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
