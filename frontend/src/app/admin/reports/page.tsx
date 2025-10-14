"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Button, Typography, Stack } from "@mui/material";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/reports/pending").then((res) => setReports(res.data));
  }, []);

  const handleAction = async (id: number, status: 'reviewed' | 'dismissed') => {
    await axios.patch(`/api/reports/${id}`, { status });
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Reportes pendientes</Typography>
      {reports.map((report) => (
        <Card key={report.id}>
          <CardContent>
            <Typography>Reportado por: {report.reporter_username}</Typography>
            <Typography>Tipo: {report.target_type}</Typography>
            <Typography>ID Contenido: {report.target_id}</Typography>
            <Typography>Motivo: {report.reason}</Typography>

            {/* Aquí podrías renderizar el post directamente usando tu componente de Post */}
            {/* <Post id={report.target_id}/> */}

            <Stack direction="row" spacing={1} mt={2}>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleAction(report.id, 'reviewed')}
              >
                Eliminar contenido
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleAction(report.id, 'dismissed')}
              >
                Descartar
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
