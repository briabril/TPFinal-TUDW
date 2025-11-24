import React from 'react'
import PostList from '@/components/posts/PostList'
import { Typography, Box } from '@mui/material'
export const metadata = {
  title: "Post – Red Social",
};
export default function PostsPage() {
  return (
    <Box style={{ padding: 16 }}>
      <Typography>Posts</Typography>
      <PostList initialMode='all'/>
    </Box>
  )
}
