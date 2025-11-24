import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { MoreVert, Edit, Delete, Flag, ContentCopy } from "@mui/icons-material";
import toast from "react-hot-toast";
import ReportDialog from "./ReportDialog";

interface PostActionsProps {
    onEdit: () => void;
    onDelete: () => void;
    onReport: (reason: string) => void;
    loading?: boolean;
    isOwn: boolean;
    postId?: string | number;
}

export default function PostActions({
    onEdit,
    onDelete,
    onReport,
    loading,
    isOwn,
    postId,
}: PostActionsProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        // Place the actions above other header elements so the menu remains clickable
    <Box sx={{ display: "flex", alignItems: "center", zIndex: 10 }}>
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
                                setDeleteOpen(true);
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
                <MenuItem
                    onClick={async () => {
                        try {
                            const origin = typeof window !== 'undefined' ? window.location.origin : '';
                            const url = `${origin}/posts/${postId}`;
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                await navigator.clipboard.writeText(url);
                            } else {
                                const ta = document.createElement('textarea');
                                ta.value = url;
                                document.body.appendChild(ta);
                                ta.select();
                                document.execCommand('copy');
                                document.body.removeChild(ta);
                            }
                            toast.success('Enlace copiado al portapapeles');
                        } catch (e) {
                            console.error('Copy failed', e);
                            toast.error('No se pudo copiar el enlace');
                        } finally {
                            handleMenuClose();
                        }
                    }}
                >
                    <ContentCopy fontSize="small" sx={{ mr: 1 }} /> Compartir
                </MenuItem>
            </Menu>

            <ReportDialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                onSubmit={onReport}
            />

            <Dialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                aria-labelledby="delete-post-dialog-title"
            >
                <DialogTitle id="delete-post-dialog-title">Eliminar post</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro que querés eliminar este post? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                    <Button
                        color="error"
                        onClick={() => {
                            try {
                                onDelete();
                            } finally {
                                setDeleteOpen(false);
                            }
                        }}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
