"use client";
import { useState, useEffect } from "react";
import { Box, CardMedia } from "@mui/material";
import { Media } from "../../types/post";
import ModalBase from "../common/Modal";


export default function PostMedia({ medias }: { medias: Media[] }) {
  const [open, setOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const handleOpen = (media: Media) => {
    if (media.type !== "AUDIO") {
      setSelectedMedia(media);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setSelectedMedia(null);
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          mt: 2,
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: medias.length <= 1 ? "1fr" : "repeat(2, 1fr)",
            md:
              medias.length >= 4
                ? "repeat(2, 1fr)"
                : medias.length === 3
                ? "repeat(3, 1fr)"
                : medias.length === 2
                ? "repeat(2, 1fr)"
                : "1fr",
          },
        }}
      >
        {medias.map((media, i) => {
          const url = media.url;
          const isAudio = media.type === "AUDIO";
          const isVideo = media.type === "VIDEO";

          return (
            <Box
              key={i}
              onClick={() => handleOpen(media)}
              sx={{
                position: "relative",
                width: "100%",
                height: isAudio ? 120 : 340,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "background.paper",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow:
                  "0 4px 10px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.1)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                cursor: isAudio ? "default" : "pointer",
                "&:hover": {
                  transform: isAudio ? "none" : "translateY(-3px)",
                  boxShadow:
                    "0 6px 14px rgba(0,0,0,0.18), inset 0 1px 3px rgba(255,255,255,0.15)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: 3,
                  boxShadow: "inset 0 1px 6px rgba(0,0,0,0.25)",
                  pointerEvents: "none",
                },
              }}
            >
              {isVideo ? (
                <CardMedia
                  component="video"
                  src={url}
                  controls
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 3,
                  }}
                />
              ) : isAudio ? (
                <CardMedia
                  component="audio"
                  src={url}
                  controls
                  sx={{
                    width: "90%",
                    filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
                  }}
                />
              ) : (
                <CardMedia
                  component="img"
                  image={url}
                  alt={`media-${i}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 3,
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.03)",
                    },
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {selectedMedia && (
        <ModalBase
          open={open}
          onClose={handleClose}
          title={
            selectedMedia.type === "VIDEO"
              ? "Reproduciendo video"
              : "Vista previa"
          }
          cancelText="Cerrar"
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {selectedMedia.type === "VIDEO" ? (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  borderRadius: 8,
                }}
              />
            ) : (
              <img
                src={selectedMedia.url}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            )}
          </Box>
        </ModalBase>
      )}
    </>
  );
}
