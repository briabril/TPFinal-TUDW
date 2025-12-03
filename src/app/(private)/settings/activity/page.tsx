"use client";

import { useEffect, useState } from "react";
import { OpenInNew } from "@mui/icons-material";
import { Box, Typography, Tabs, Tab, Card, CardContent, Avatar, Link, CardMedia, Stack, Paper } from "@mui/material";
import Sidebar from "@/components/sidebar/Sidebar";
import SettingsSidebar from "@/components/sidebar/SettingsPanel";
import api from "../../../../api/index";
import { Main } from "next/document";
import { Media } from "../../../../types/post";
import MediaGrid from "@/components/media/MediaGrid";
export default function ActivityPage() {
  const [tab, setTab] = useState(0);

  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [sharedPosts, setSharedPosts] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // diferencia en segundos

    if (diff < 60) return "ahora";
    if (diff < 3600) {
      const m = Math.floor(diff / 60);
      return `${m} min${m > 1 ? "s" : ""}`;
    }
    if (diff < 86400) {
      const h = Math.floor(diff / 3600);
      return `${h} h${h > 1 ? "s" : ""}`;
    }
    const d = Math.floor(diff / 86400);
    if (d < 7) return `${d} día${d > 1 ? "s" : ""}`;
    return date.toLocaleDateString();
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const [likes, shares, comments] = await Promise.all([
          api.get("/reactions/mine/posts"),
          api.get("/posts/mine/shared"),
          api.get("/comments/mine")
        ]);

        setLikedPosts(likes.data);
        setSharedPosts(shares.data);
        setMyComments(comments.data);

      } catch (err) {
        console.error("Error cargando actividad:", err);
      }
    }

    fetchData();
  }, []);


  return (
    <Box sx={{ display: "flex", gap: 4, p: 4 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Tu actividad
        </Typography>

        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Likes" />
          <Tab label="Reposts" />
          <Tab label="Comentarios" />
        </Tabs>


        {tab === 0 && (
          <Box>
            {likedPosts.length === 0 && (
              <Typography color="text.secondary">No diste likes aún.</Typography>
            )}

            {likedPosts.map((post: any) => (
              <Card key={post.id} sx={{ mb: 2 }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={post.post_author_avatar || "/default-avatar.png"}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      {post.author_username}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ mt: 0.5, mb: 1, fontSize: 14, color: "text.secondary" }}
                  >
                    {post.content}
                  </Typography>
                  {post.media?.length > 0 && (

                    <MediaGrid media={post.media} />

                  )}

                  <Link
                    href={`/posts/${post.id}`}
                    style={{
                      marginTop: 8,
                      display: "inline-block",
                      fontSize: 13,
                      color: "#1976d2",
                      fontWeight: 500
                    }}
                  >
                    Ver post
                  </Link>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}


        {tab === 1 && (
          <Box>
            {sharedPosts.length === 0 && (
              <Typography color="text.secondary">No hiciste reposts aún.</Typography>
            )}

            {sharedPosts.map((post: any) => (
              <Card key={post.id} sx={{ mb: 2, display: "flex" }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={post.post_author_avatar || "/default-avatar.png"}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      {post.author_username}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ mt: 0.5, mb: 1, fontSize: 14, color: "text.secondary" }}
                  >
                    {post.original_content}
                  </Typography>
                  {post.media?.length > 0 && (
                    <MediaGrid media={post.media} />

                  )}
                  <Link
                    href={`/posts/${post.id}`}
                    style={{
                      marginTop: 8,
                      display: "inline-block",
                      fontSize: 13,
                      color: "#1976d2",
                      fontWeight: 500
                    }}
                  >
                    Ver post
                  </Link>
                </CardContent>




              </Card>
            ))}
          </Box>
        )}


        {tab === 2 && (
          <Box>
            {myComments.length === 0 && (
              <Typography color="text.secondary">
                No comentaste ningún post aún.
              </Typography>
            )}

            {myComments.map((comment: any) => (
              <Card
                key={comment.id}
                sx={{ mb: 2, p: 1.5, borderRadius: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={comment.post_author_avatar || "/default-avatar.png"}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    {comment.post_author}
                  </Typography>
                </Box>
                <Typography
                  sx={{ mt: 0.5, mb: 1, fontSize: 14, color: "text.secondary" }}
                >
                  {comment.post_content}
                </Typography>

                {comment.media?.length > 0 && (
                  <MediaGrid media={comment.media} />
                )}
                <Box sx={{ mt: 1.5, display: "flex", gap: 1 }}>
                  <Avatar
                    src={comment.comment_author_avatar || "/default-avatar.png"}
                    sx={{ width: 26, height: 26 }}
                  />

                  <Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                        {comment.comment_author}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: 14 }}>
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
                <Link
                  href={`/posts/${comment.post_id}`}
                  style={{
                    marginTop: 8,
                    display: "inline-block",
                    fontSize: 13,
                    color: "#1976d2",
                    fontWeight: 500
                  }}
                >
                  Ver post
                </Link>

              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
