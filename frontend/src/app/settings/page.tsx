"use client";
import { useState, useEffect } from "react";
import api from "@tpfinal/api";
import Sidebar from "@/components/Sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfilSchema, ProfileData } from "@tpfinal/schemas";
import { Button, TextField, Container, Paper, Typography, Box } from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@tpfinal/types";
export default function EditProfilePage() {
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
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

  const bioValue = watch("bio") || "";
  const bioLength = bioValue.length;
  const maxBioLength = 160;
  //Obtener el usuario logueado
  useEffect(() => {
    async function fetchMe() {
      setLoading(true);
      try {
        const res = await api.get<User>("/users/me", {
          withCredentials: true
        });

        const fetchedUser = res.data;
        setUserId(fetchedUser.id);
        setValue("displayname", fetchedUser.displayname || "");
        setValue("bio", fetchedUser.bio || "");
        setUser(fetchedUser);
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "No autenticado"
        );
      }
      setLoading(false);
    }
    fetchMe();
  }, [setValue, setUser]);

  
// Actualizar los datos del usuario
const onSubmit = async (data: ProfileData) => {
  if (!userId) return toast.error("No autenticado");
 try {
      const formData = new FormData();
      formData.append("displayname", data.displayname);
      if (data.password && data.password.trim() !== '') {
      formData.append("password", data.password);
      }
      if (data.new_password && data.new_password.trim() !== '') {
        formData.append("new_password", data.new_password);
      }
      if (data.bio && data.bio.trim() !== '') {
        formData.append("bio", data.bio);
      }

      const profilePictureField = data.profile_picture_url as unknown;
      const profileFile =
        profilePictureField instanceof FileList
          ? profilePictureField.item(0)
          : Array.isArray(profilePictureField)
          ? profilePictureField[0]
          : profilePictureField instanceof File
          ? profilePictureField
          : null;

      if (profileFile instanceof File) {
        formData.append("profile_picture_url", profileFile);
      }

      const res = await api.put<{ user: User }>(`/users/${userId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        setValue("displayname", updatedUser.displayname ?? "");
        setValue("bio", updatedUser.bio ?? "");
        setValue("profile_picture_url", undefined);
      }

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
  <Container maxWidth="lg" sx={{ minHeight: "100vh",
    display: "flex",
    flexDirection: "row", 
     justifyContent: "space-between", 
  alignItems: "flex-start", 

     }}>
 <Sidebar />
 <Paper
        elevation={6}
        sx={{
          p: 5,
           flex: 1, 
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          minHeight: "100vh"
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
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Bio</Typography>
              <Typography variant="caption" color={bioLength > maxBioLength? "error" : "text.secondary"}> {bioLength}/{maxBioLength}</Typography>

       
          </Box>
          <TextField
            label="Bio"
            fullWidth
            {...register("bio")}
             error={!!errors.bio}
            helperText={errors.bio?.message || (bioLength > maxBioLength ? "Has superado el máximo de 160 caracteres" : "")}
          />
               </Box>
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