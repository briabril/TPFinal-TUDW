"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import api from "../../../api/index";

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
  TextField,
} from "@mui/material";

import {
  ReportProblem,
  Delete,
  CheckCircle,
  OpenInNew,
  Search,
  ErrorOutline,
  Block,
  DoneAll,
} from "@mui/icons-material";

import { Report } from "../../../types/report";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({ pending: 0, blocked: 0, dismissed: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "blocked" | "dismissed">("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true
     const initialLoadedRef = { current: false }

    const fetchData = async () => {
      if (!mounted) return
      const isInitial = !initialLoadedRef.current
      if (isInitial) setLoading(true)
      try {
        const listRes = await api.get<Report[]>(`/reports/${tab}`);
        if (!mounted) return
        setReports(listRes.data);

        setStats((prev) => ({
          ...prev,
          [tab]: listRes.data.length,
        }));
        initialLoadedRef.current = true
      } finally {
        if (!mounted) return
        if (isInitial) setLoading(false)
      }
    };

    initialLoadedRef.current = false

    fetchData();

    const interval = setInterval(() => {
      fetchData()
    }, 8000)

    return () => { mounted = false; clearInterval(interval) }
  }, [tab]);

  const statsIntervalRef = useRef<number | null>(null)
  const fetchStats = useCallback(async () => {
    try {
      const [pendingRes, blockedRes, dismissedRes] = await Promise.all([
        api.get<Report[]>("/reports/pending"),
        api.get<Report[]>("/reports/blocked"),
        api.get<Report[]>("/reports/dismissed"),
      ])
      setStats({
        pending: pendingRes.data.length,
        blocked: blockedRes.data.length,
        dismissed: dismissedRes.data.length,
      })
    } catch (e) {
    }
  }, [])

  useEffect(() => {
    fetchStats()
    statsIntervalRef.current = window.setInterval(() => fetchStats(), 8000)
    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current)
    }
  }, [fetchStats])

  const filtered = useMemo(() => {
    return reports.filter(
      (r) =>
        r.reporter_username?.toLowerCase().includes(search.toLowerCase()) ||
        r.reason?.toLowerCase().includes(search.toLowerCase()) ||
        r.target_id?.toString().includes(search)
    );
  }, [reports, search]);

  const handleAction = async (id: string, target_id: string | number, action: "blocked" | "dismissed") => {
    setActionLoading(id);
    try {
      await api.patch(`/reports/${id}`, { action, target_id });

      setReports((prev) => {
        const updated = prev.filter((r) => r.id !== id);

        setStats((prevStats) => ({
          ...prevStats,
          [tab]: updated.length,
        }));

        return updated;
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevert = async (id: string, target_id: string | number) => {
    setActionLoading(id);
    try {
      await api.patch(`/reports/${id}/revert`, { target_id });

      setReports((prev) => {
        const updated = prev.filter((r) => r.id !== id);

        setStats((prevStats) => ({
          ...prevStats,
          [tab]: updated.length,
        }));

        return updated;
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Stack spacing={4} sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 5 } }}>
      <Stack textAlign="center" spacing={0.5}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Reportes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Moderación y control del contenido reportado
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StatCard
          icon={<ErrorOutline />}
          label="Pendientes"
          value={stats.pending}
          active={tab === "pending"}
          onClick={() => setTab("pending")}
        />
        <StatCard
          icon={<Block />}
          label="Bloqueados"
          value={stats.blocked}
          active={tab === "blocked"}
          onClick={() => setTab("blocked")}
        />
        <StatCard
          icon={<DoneAll />}
          label="Descartados"
          value={stats.dismissed}
          active={tab === "dismissed"}
          onClick={() => setTab("dismissed")}
        />
      </Stack>

      <Box sx={{ maxWidth: 400, mx: "auto", position: "relative" }}>
        <Search sx={{ position: "absolute", top: 11, left: 10, fontSize: 18, color: "text.secondary" }} />
        <TextField
          fullWidth
          placeholder="Buscar por usuario, motivo o ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            "& .MuiInputBase-input": { pl: 4 },
          }}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      )}

      {!loading && filtered.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }} elevation={0}>
          <ReportProblem sx={{ fontSize: 40, mb: 1, color: "warning.main" }} />
          <Typography variant="h6">No hay reportes para mostrar</Typography>
        </Paper>
      )}

      {!loading &&
        filtered.map((report) => (
          <Card
            key={report.id}
            sx={{
              borderRadius: 3,
              borderLeft: `6px solid ${
                report.target_type === "post" ? "#1976d2" : "#9c27b0"
              }`,
            }}
          >
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ReportProblem color="warning" />
                  <Typography fontWeight="bold" variant="h6">
                    Reporte #{report.id}
                  </Typography>
                </Stack>

                <Divider />

                <Info label="Reportado por" value={report.reporter_username} />

                <Info
                  label="Tipo"
                  value={
                    <Chip
                      label={report.target_type.toUpperCase()}
                      color={report.target_type === "post" ? "primary" : "secondary"}
                      size="small"
                    />
                  }
                />

                <Info
                  label="Contenido"
                  value={
                    report.target_type === "post" ? (
                      <Link href={`/posts/${report.target_id}`} style={{ color: "#1976d2", fontWeight: 500 }}>
                        Ver post <OpenInNew sx={{ fontSize: 16 }} />
                      </Link>
                    ) : (
                      report.target_id
                    )
                  }
                />

                <Info label="Motivo" value={report.reason} />

                {tab === "pending" && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={1}>
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      startIcon={<Delete />}
                      onClick={() => handleAction(report.id, report.target_id, "blocked")}
                      disabled={actionLoading === report.id}
                    >
                      Eliminar contenido
                    </Button>

                    <Button
                      variant="outlined"
                      color="success"
                      fullWidth
                      startIcon={<CheckCircle />}
                      onClick={() => handleAction(report.id, report.target_id, "dismissed")}
                      disabled={actionLoading === report.id}
                    >
                      Descartar
                    </Button>
                  </Stack>
                )}

                {tab === "blocked" && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<OpenInNew />}
                      href={`/posts/${report.target_id}`}
                    >
                      Ver contenido
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<CheckCircle />}
                      onClick={() => handleRevert(report.id, report.target_id)}
                      disabled={actionLoading === report.id}
                    >
                      Revertir bloqueo
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
    </Stack>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <Box display="flex" gap={1} alignItems="center">
      <Typography component="span" fontWeight="bold">
        {label}:
      </Typography>
      <Box component="span" fontWeight={400}>
        {value}
      </Box>
    </Box>
  );
}

function StatCard({ icon, label, value, active, onClick }: any) {
  return (
    <Stack
      flex={1}
      alignItems="center"
      onClick={onClick}
      spacing={0.5}
      sx={{
        p: 2,
        borderRadius: 3,
        border: active ? "2px solid #1976d2" : "1px solid rgba(0,0,0,0.1)",
        transition: "0.2s",
        cursor: "pointer",
        "&:hover": { boxShadow: 3 },
        textAlign: "center",
      }}
    >
      <Box fontSize={22}>{icon}</Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
    </Stack>
  );
}
