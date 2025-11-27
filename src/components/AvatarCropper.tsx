"use client";
import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Box } from "@mui/material";
import { getCroppedImg } from "@/utils/cropImage";

type Props = {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropped: (file: File) => void;
  aspect?: number;
};

export default function AvatarCropper({ open, imageSrc, onClose, onCropped, aspect = 1 }: Props) {
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedPixels, setCroppedPixels] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (!imageSrc) {
        console.error("AvatarCropper: no imageSrc available when saving");
        return;
      }
      const blob = await getCroppedImg(imageSrc, croppedPixels, 300);
      if (!blob) {
        console.error("AvatarCropper: getCroppedImg returned null blob", { croppedPixels });
        return;
      }
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      onCropped(file);
      onClose();
    } catch (err) {
      console.error("AvatarCropper: error during save", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Recortar foto de perfil</DialogTitle>
      <DialogContent>
        <Box sx={{ position: "relative", width: "100%", height: 360, bgcolor: "grey.100" }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </Box>
        <Box sx={{ mt: 2, px: 1 }}>
          <Slider value={zoom} min={1} max={3} step={0.01} onChange={(e, v) => setZoom(Array.isArray(v) ? v[0] : v)} />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          Usar imagen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
