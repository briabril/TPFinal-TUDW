" use client"
import { Box, Typography } from "@mui/material"
export default function NotificationsPage (){
    return(
<Box display="flex" flexDirection="column" justifyContent="center" alignItems="start">
<Typography variant="h5" component="h1">Notificaciones</Typography>
         <Box 
        component="img"
        sx={{
            width:600,
            height: 600,
    maxHeight: { xs: 400, md: 500 },
    maxWidth: { xs: 400, md: 500 },
  }}
  alt="Page in construction"
  src="/page-in-construction.png"/>
</Box>
       

    )
}