const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const cookieParser = require("cookie-parser");
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import blockRoutes from "./routes/blockRoutes";
import { attachIO } from "./middleware/socket";
import postRoutes from "./routes/postRoutes";
import reactionRoutes from "./routes/reactionRoutes";
import commentRoutes from "./routes/commentRoutes"
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
}));


// Servidor HTTP y Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});
// Middleware para agregar io a req
app.use(attachIO(io));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
// Escuchamos conexión
io.on("connection", (socket: any) => {
    console.log("✅ Cliente conectado:", socket.id);

  socket.on("disconnect", (reason: any) => {
    console.log("❌ Cliente desconectado:", socket.id, "Motivo:", reason);
  });
});

// Se levanta el servidor
server.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
