"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Tabs, Tab, Card, CardContent, Avatar } from "@mui/material";
import Sidebar from "@/components/sidebar/Sidebar";
import SettingsSidebar from "@/components/sidebar/SettingsSidebar";
import api from "../../../api/index";
import { Main } from "next/document";

export default function ActivityPage() {
  const [tab, setTab] = useState(0);

const [likedPosts, setLikedPosts] = useState<any[]>([]);
const [sharedPosts, setSharedPosts] = useState<any[]>([]);
const [myComments, setMyComments] = useState<any[]>([]);

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
      
     
      <Box sx={{ display: "flex",  gap: 2 }}>
        <Sidebar />
        <SettingsSidebar />
      </Box>

     
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
          alt={post.author_username}
          sx={{ width: 40, height: 40 }}
        />
        <Typography variant="subtitle1" fontWeight={600}>
          {post.author_username}
        </Typography>
      </Box>

      <Typography>{post.content}</Typography>
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
              <Card key={post.id} sx={{ mb: 2, display: "flex"}}>
                <CardContent sx={{display: "flex", flexDirection: "column", gap:3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          src={post.post_author_avatar || "/default-avatar.png"}
          alt={post.author_username}
          sx={{ width: 40, height: 40 }}
        />
        <Typography variant="subtitle1" fontWeight={600}>
          {post.author_username}
        </Typography>
      </Box>
                  
                  <Typography>{post.original_content}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

       
        {tab === 2 && (
          <Box>
           {myComments.map((comment: any) => (
  <Card key={comment.id} sx={{ mb: 2 }}>
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

    
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          src={comment.post_author_avatar || "/default-avatar.png"}
          alt={comment.post_author}
          sx={{ width: 40, height: 40 }}
        />

        <Typography variant="subtitle1" fontWeight={600}>
          {comment.post_author}
        </Typography>
      </Box>

      {/* Texto del comentario */}
      <Typography sx={{ ml: 5 }}>
        {comment.content}
      </Typography>

    </CardContent>
  </Card>
))}
</Box>)}
      </Box>
        </Box>
  )
}
