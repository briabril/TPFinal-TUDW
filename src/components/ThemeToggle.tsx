"use client"
import { SunMedium , Moon  } from 'lucide-react';
import { Button } from '@mui/material';
import { useThemeContext } from '@/app/context/ThemeContext';
const ThemeToggle = () => {
  const {darkMode, toggleDarkMode}  = useThemeContext();
  
  
  return (
   <Button

   variant="outlined"
    size="small"
    onClick={toggleDarkMode}
            sx={{ borderRadius: 2, p: 1}}
   >
    {darkMode ? <SunMedium/> : <Moon/>}
   </Button>
  );
};

export default ThemeToggle  