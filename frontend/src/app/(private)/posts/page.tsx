import React from 'react'
import PostList from '@/components/posts/PostList'
import { Typography, Box } from '@mui/material'

export default function PostsPage() {
  return (
    <Box style={{ padding: 16 }}>
      <Typography>Posts</Typography>
      <PostList />
    </Box>
  )
}
