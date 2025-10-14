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


export const getPending = async (req: Request, res: Response) => {
  try {
    const reports = await ReportModel.getPendingReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reportes" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const report = await ReportModel.updateReportStatus(Number(id), status);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar reporte" });
  }
};
