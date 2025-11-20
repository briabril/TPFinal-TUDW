import  io, {Socket } from "socket.io-client";

const socket: Socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
  transports: ["websocket", "polling"],
});

// Eventos globales de conexión
socket.on("connect", () => console.log("✅ Socket conectado:", socket.id));
socket.on("disconnect", (reason) =>
  console.log("❌ Socket desconectado:", reason)
);
socket.on("connect_error", (err) =>
  console.error("⚠️ Error de conexión:", err)
);

export default socket;
