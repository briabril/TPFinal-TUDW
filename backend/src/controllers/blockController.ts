import { Request, Response } from "express";
import * as BlockModel from "../models/blockModel";
import db from "../db";

export async function block(req: Request, res: Response) {
    try {
        const blockerId = req.user!.id;
        const targetId = req.params.targetId;

        if (!targetId) return res.status(400).json({ message: "targetId requerido" });
        if (blockerId === targetId) return res.status(400).json({ message: "No podés bloquearte a vos mismo" });

        const userRes = await db.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [targetId]);
        if (userRes.rowCount === 0) return res.status(404).json({ message: "Usuario objetivo no encontrado" });

        await BlockModel.blockUser(blockerId, targetId);
        return res.json({ message: "Usuario bloqueado correctamente" });
    } catch (err) {
        console.error("block error:", err);
        return res.status(500).json({ message: "Error al bloquear usuario" });
    }
}

export async function unblock(req: Request, res: Response) {
    try {
        const blockerId = req.user!.id;
        const targetId = req.params.targetId;

        if (!targetId) return res.status(400).json({ message: "targetId requerido" });

        await BlockModel.unblockUser(blockerId, targetId);
        return res.json({ message: "Usuario desbloqueado correctamente" });
    } catch (err) {
        console.error("unblock error:", err);
        return res.status(500).json({ message: "Error al desbloquear usuario" });
    }
}

/** Devuelve { blockedByYou, blockedByThem } para la UI */
export async function status(req: Request, res: Response) {
    try {
        const viewerId = req.user!.id;
        const targetId = req.params.targetId;
        if (!targetId) return res.status(400).json({ message: "targetId requerido" });

        const st = await BlockModel.getBlockStatus(viewerId, targetId);
        return res.json(st);
    } catch (err) {
        console.error("status error:", err);
        return res.status(500).json({ message: "Error al obtener estado de bloqueo" });
    }
}
