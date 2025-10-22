import React from 'react'
import ListaPosts from '@/components/ListPosts'
import { Typography, Box } from '@mui/material'

export default function PostsPage() {
  return (
    <Box style={{ padding: 16 }}>
      <Typography>Posts</Typography>
      <ListaPosts />
    </Box>
  )
}
