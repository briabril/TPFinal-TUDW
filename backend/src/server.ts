
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes"
import blockRoutes from './routes/blockRoutes'
import postRoutes from "./routes/postRoutes";
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos de uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blocks", blockRoutes)

// Rutas de posts
app.use("/api/posts", postRoutes);
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
