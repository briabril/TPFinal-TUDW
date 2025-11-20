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
        const res = await api.get("/auth/socket-token", { withCredentials: true });
        const token = res.data?.token;
        if (!token) return;

        const socket = io("https://www.api.bloop.cool", {
          auth: { token },
          withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => console.log("Socket connected", socket.id));
        socket.on("disconnect", (reason) => console.log("Socket disconnected", reason));
      } catch (err) {
        console.error("Error setting up socket", err);
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
