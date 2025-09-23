
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
import userRoutes from "./routes/userRoutes";
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
