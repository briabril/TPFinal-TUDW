"use client";
import { Box, CardMedia } from "@mui/material";
import { Media } from "@/types";

interface MediaGridProps {
  media: Media[];
}

export default function MediaGrid({ media }: MediaGridProps) {
  if (!media || media.length === 0) return null;

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {media.map((m, i) => {
        const isVideo = m.type === "VIDEO";
        const isAudio = m.type === "AUDIO";

        return (
          <Box
            key={i}
            sx={{
              width: 100,
              height: 100,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Imagen */}
            {!isVideo && !isAudio && (
              <CardMedia
                component="img"
                image={m.url}
                alt="mini-media"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

            {/* Video */}
            {isVideo && (
              <CardMedia
                component="video"
                src={m.url}
                muted
                loop
                autoPlay
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  background: "black",
                }}
              />
            )}

            {/* Audio */}
            {isAudio && (
              <audio
                src={m.url}
                controls
                style={{ width: "90%", height: 30 }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
