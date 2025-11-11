const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const cookieParser = require("cookie-parser");
const session = require("express-session");
import type { Request, Response } from "express";
import translationRoutes from "./routes/translationRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes"
import blockRoutes from "./routes/blockRoutes"
import { attachIO } from "./middleware/socket"
import postRoutes from "./routes/postRoutes"
import reactionRoutes from "./routes/reactionRoutes"
import commentRoutes from "./routes/commentRoutes"
import followRoutes from "./routes/followRoutes"
import reportRoutes from "./routes/reportRoutes"
import passport from "./config/passport";
import countryRoutes from "./routes/countryRoutes";
import weatherRoutes from "./routes/weatherRoutes";
import photoRoutes from "./routes/photoRoutes";
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares base
app.use(cors({ origin: "http://localhost:3000", credentials: true ,    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);
// Config sesión (necesaria para Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
   cookie: {
      httpOnly: true,
      secure: true, 
      sameSite: "none",
        domain: "localhost",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback de Google
app.get(
  "/auth/google/callback",
  (req: Request, res: Response, next: any) => {
    console.log("📩 Callback recibido de Google:", req.query);
    next();
  },
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/login" }),
 async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.redirect("http://localhost:3000/login");

    //  generar token JWT 
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: (user as any).id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // cookie httpOnly 
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
  path: "/",
      secure: true,
    });
    res.status(200).json({
  message: "Login exitoso",
  token,
  user
});
    res.redirect("http://localhost:3000/feed");
  }
);
// Servidor HTTP y Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "http://localhost:3000", credentials: true },
});
app.use(attachIO(io));

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/translate", translationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/photo", photoRoutes);

// Socket.IO
io.on("connection", (socket: any) => {
  console.log("✅ Cliente conectado:", socket.id);
  socket.on("disconnect", (reason: any) => {
    console.log("❌ Cliente desconectado:", socket.id, "Motivo:", reason);
  });
});

// Start server
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
