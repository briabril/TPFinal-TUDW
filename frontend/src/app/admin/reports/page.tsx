"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@tpfinal/api";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Stack,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ReportProblem,
  Delete,
  CheckCircle,
  OpenInNew,
} from "@mui/icons-material";
import { Report } from "@tpfinal/types";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
const [tab, setTab] = useState<"pending" | "blocked" | "dismissed">("pending");


  // carga los reportes según la pestaña activa
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get<Report[]>(`/reports/${tab}`);
        setReports(res.data);
      } catch (error) {
        console.error("Error al obtener reportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [tab]);

const handleAction = async (id: string, target_id: string | number, action: "blocked" | "dismissed") => {
  setActionLoading(id);
  try {
    await api.patch(`/reports/${id}`, { action, target_id });


    setReports(prev => prev.filter(r => r.id !== id));
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
  } finally {
    setActionLoading(null);
  }
};


  return (
    <Stack spacing={3} sx={{ maxWidth: 800, mx: "auto", mt: 4, mb: 6 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center">
        Gestión de Reportes
      </Typography>
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Pendientes" value="pending" />
        <Tab label="Bloqueados" value="blocked" />
        <Tab label="Descartados" value="dismissed" />
      </Tabs>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            color: "text.secondary",
            borderRadius: 3,
          }}
          elevation={0}
        >
          <ReportProblem sx={{ fontSize: 40, mb: 1, color: "warning.main" }} />
          <Typography variant="h6">
            No hay reportes {tab === "pending" ? "pendientes" : "en esta categoría"} 🎉
          </Typography>
        </Paper>
      ) : (
        reports.map((report) => (
          <Card
            key={report.id}
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              borderLeft: `6px solid ${
                report.target_type === "post" ? "#1976d2" : "#9c27b0"
              }`,
            }}
          >
            <CardContent>
              <Stack spacing={1.2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ReportProblem color="warning" />
                  <Typography variant="h6" fontWeight="bold">
                    Reporte #{report.id}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Typography>
                  <strong>Reportado por:</strong> {report.reporter_username}
                </Typography>

                <Typography component="div">
                  <strong>Tipo de contenido:</strong>{" "}
                  <Chip
                    label={report.target_type.toUpperCase()}
                    color={
                      report.target_type === "post" ? "primary" : "secondary"
                    }
                    size="small"
                  />
                </Typography>

                <Typography>
                  <strong>ID del contenido:</strong>{" "}
                  {report.target_type === "post" ? (
                    <Link
                      href={`/posts/${report.target_id}`}
                      style={{
                        color: "#1976d2",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      Ver post <OpenInNew fontSize="small" sx={{ ml: 0.5 }} />
                    </Link>
                  ) : (
                    report.target_id
                  )}
                </Typography>

                <Typography>
                  <strong>Motivo:</strong> {report.reason}
                </Typography>

                {tab === "pending" && (
                  <Stack direction="row" spacing={1.5} mt={2}>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleAction(report.id, report.target_id, "blocked" )}
                      disabled={actionLoading === report.id}
                    >
                      Eliminar contenido
                    </Button>

                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleAction(report.id, report.target_id, "dismissed")}
                      disabled={actionLoading === report.id}
                    >
                      Descartar reporte
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}
