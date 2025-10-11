import React from 'react'
import ListaPosts from '@/components/ListaPosts'
import ThemeToggle from '@/components/ThemeToggle'
import { Box, Typography } from '@mui/material'
export default function userFeed() {
    return (
        <Box style={{ padding: 16 }}>
            <div className="absolute top-3 right-60">
         <ThemeToggle  />
      </div>
            <Typography>Mi feed</Typography>
            <ListaPosts mineOnly />
        </Box>
    )
}