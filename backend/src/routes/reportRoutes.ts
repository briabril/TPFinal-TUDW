import { Router } from "express";
import { create, updateStatus, getByStatus } from "../controllers/reportController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

// Crear un nuevo reporte
router.post("/", authenticateJWT, create);

// Obtener reportes por estado (pending, reviewed, dismissed)
router.get("/:status", authenticateJWT, getByStatus);

// Actualizar estado del reporte
router.patch("/:id", authenticateJWT, updateStatus);

export default router;
