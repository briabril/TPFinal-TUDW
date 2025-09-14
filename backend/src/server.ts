// backend/src/server.ts
import express from "express";
import cors from "cors";
import usersRouter from "./routes/user";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Backend funcionando desde monorepo!");
});

app.use("/api/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
