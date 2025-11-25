"use client";

import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SearchPanel from "./SearchPanel";
import SettingsPanel from "./SettingsPanel";

interface SidebarPanelProps {
  activePanel: string;
  onClose?: () => void;
}

export default function SidebarPanel({ activePanel, onClose }: SidebarPanelProps) {
  const isOpen = activePanel !== "none";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={activePanel}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          style={{
            position: "fixed",
            top: 0,
            left: 70,
            width: 270,
            height: "100vh",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "0 18px 18px 0",
            boxShadow: "4px 0 25px rgba(0,0,0,0.07)",
            zIndex: 2000,
            overflowY: "auto",
          }}
        >
          <Box sx={{ height: "100%", p: 2 }}>
            {activePanel === "search" && <SearchPanel onClose={onClose} />}
            {activePanel === "settings" && <SettingsPanel />}
            {activePanel === "messages" && <p>Mensajes en construcción</p>}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
