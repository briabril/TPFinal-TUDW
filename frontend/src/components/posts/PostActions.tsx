import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Box } from "@mui/material";
import { MoreVert, Edit, Delete, Flag } from "@mui/icons-material";
import ReportDialog from "./ReportDialog";

interface PostActionsProps {
    onEdit: () => void;
    onDelete: () => void;
    onReport: (reason: string) => void;
    loading?: boolean;
    isOwn: boolean;
}

export default function PostActions({
    onEdit,
    onDelete,
    onReport,
    loading,
    isOwn,
}: PostActionsProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [reportOpen, setReportOpen] = useState(false);

    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ position: "absolute", top: -76, right: 0 }}>
            <IconButton onClick={handleMenuOpen}>
                <MoreVert />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {isOwn &&
                    [
                        <MenuItem
                            key="edit"
                            onClick={() => {
                                onEdit();
                                handleMenuClose();
                            }}
                        >
                            <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
                        </MenuItem>,
                        <MenuItem
                            key="delete"
                            onClick={() => {
                                onDelete();
                                handleMenuClose();
                            }}
                            disabled={loading}
                        >
                            <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
                        </MenuItem>,
                    ]}


                {!isOwn && (
                    <MenuItem
                        onClick={() => {
                            setReportOpen(true);
                            handleMenuClose();
                        }}
                        disabled={loading}
                    >
                        <Flag fontSize="small" sx={{ mr: 1 }} /> Reportar
                    </MenuItem>
                )}
            </Menu>

            <ReportDialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                onSubmit={onReport}
            />
        </Box>
    );
}
