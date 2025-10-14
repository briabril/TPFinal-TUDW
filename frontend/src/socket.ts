import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:4000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
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
