"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfilSchema, ProfileData } from "@/schemas/editProfile";
import {Button, TextField, Container, Paper, Typography, Box} from "@mui/material"
import toast from "react-hot-toast";
export default function EditProfilePage() {
  const{
    register,
    handleSubmit,
    setValue,
    formState: {errors, isSubmitting},
  } = useForm<ProfileData>({
    resolver: zodResolver(editProfilSchema),
  defaultValues: {
    displayname: "",
    bio: "",
    password: "",
    new_password: "",
    profile_picture_url: undefined,
  },
});
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  //Obtener el usuario logueado
  useEffect(() => {
    async function fetchMe() {
      setLoading(true);
      try {
        const res = await api.get("http://localhost:4000/api/users/me", {
          withCredentials: true
        });
    
        type User = {
          id: string;
          username: string;
          displayname: string;
          bio?: string;
          profilePicture?: string;
        };
        const user = res.data as User;
            setUserId(user.id);
setValue("displayname", user.displayname || "");
setValue("bio", user.bio || "");
        
        setUserId(user.id);
       
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "No autenticado"
        );
      }
      setLoading(false);
    }
    fetchMe();
  }, [setValue]);

  
// Actualizar los datos del usuario
const onSubmit = async (data: ProfileData) => {
  if (!userId) return toast.error("No autenticado");
 try {
      const formData = new FormData();
      formData.append("displayname", data.displayname);
      formData.append("password", data.password);
      formData.append("new_password", data.new_password);
      formData.append("bio", data.bio);

      if (data.profile_picture_url instanceof File) {
        formData.append("profile_picture_url", data.profile_picture_url);
      }

      const res = await api.put(`/users/${userId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("¡Perfil actualizado correctamente!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Error de conexión con el servidor."
      );
    }
  };
 

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <span className="text-white text-lg">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" sx={{minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",}}>
 <Sidebar />
 <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
         <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
          Editar Perfil
        </Typography>
         <Box
          component="form"
            onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2.5}
        >

           <TextField
            label="Nombre de Usario"
            fullWidth
            {...register("displayname")}
            error={!!errors.displayname}
            helperText={errors.displayname?.message}
          />
          <TextField
            label="Bio"
            fullWidth
            {...register("bio")}
             error={!!errors.bio}
            helperText={errors.bio?.message}
          />
          <TextField
            label="Contraseña anterior"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
           <TextField
            label="Nueva contraseña"
            fullWidth
            {...register("new_password")}
            error={!!errors.new_password}
            helperText={errors.new_password?.message}
          />
          <label htmlFor="profile_picture_url">Elija una foto de perfil:</label>
          <input type="file" id="profile_picture_url" {...register("profile_picture_url")} accept="image/png, image/jpeg"/>
          {errors.profile_picture_url && (
            <p className="text-red-600">{errors.profile_picture_url.message as string}</p>
          )}
          
             <Button
        type = "submit"
        variant = "contained"
        color ="primary"
        size = "large"
        disabled = {isSubmitting}
        sx={{borderRadius: 2, py:1.5, fontWeight:600}}
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        </Box>
      </Paper>
    </Container>
     
      
       
       
     
      
   
     
    
  );
}