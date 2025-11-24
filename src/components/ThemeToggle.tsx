"use client"
import { SunMedium , Moon  } from 'lucide-react';
import { Button, useTheme } from '@mui/material';
import { useThemeContext } from '@/context/ThemeContext';
const ThemeToggle = () => {
  const {darkMode, toggleDarkMode}  = useThemeContext();
  const theme = useTheme();
  const iconColor = darkMode ? theme.palette.common.white : undefined;
  
  return (
   <Button

   variant="outlined"
    size="small"
    onClick={toggleDarkMode}
            sx={{ borderRadius: 2, p: 1, color: darkMode ? 'common.white' : undefined }}
   >
    {darkMode ? <SunMedium color={iconColor} /> : <Moon color={iconColor} />}
   </Button>
  );
};

export default ThemeToggle;