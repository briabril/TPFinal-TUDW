import { Request, Response } from "express";
import * as ReportModel from "../models/reportModel";

export const create = async (req: Request, res: Response) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const reporterId = (req as any).user.id;
    const report = await ReportModel.createReport(
      reporterId,
      targetType,
      targetId,
      reason
    );
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear reporte" });
  }
};


export const getByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;

    if (!['pending', 'blocked', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const reports = await ReportModel.getReportsByStatus(status as 'pending' | 'blocked' | 'dismissed');
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener reportes" });
  }
};


export const updateStatus = async (req: Request, res: Response) => {
   console.log("🪵 PATCH /reports/:id");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("User:", req.user); 
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: "Falta el campo 'status'" });
    }

    const report = await ReportModel.updateReportStatus(id, status);

    if (!report) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    res.json(report);
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    res.status(500).json({ message: "Error interno al actualizar reporte" });
  }
};
