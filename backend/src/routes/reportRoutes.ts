import { Router } from "express";
import * as ReportController from "../controllers/reportController";
import { authenticateJWT, authorizeRoles } from "../middleware/auth"; 

const router = Router();

// ✅ Usuarios logueados pueden reportar
router.post("/", authenticateJWT, ReportController.create);

// ✅ Solo administradores pueden listar y actualizar reportes
router.get("/pending", authenticateJWT, authorizeRoles("ADMIN"), ReportController.getPending);
router.patch("/:id", authenticateJWT, authorizeRoles("ADMIN"), ReportController.updateStatus);

export default router;
