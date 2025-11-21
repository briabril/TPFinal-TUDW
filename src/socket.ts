import  io, {Socket } from "socket.io-client";

const socket: Socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
  transports: ["websocket", "polling"],
});

// Eventos globales de conexión (silenciosos en producción/development)
socket.on("connect", () => {});
socket.on("disconnect", () => {});
socket.on("connect_error", () => {});

export default socket;
