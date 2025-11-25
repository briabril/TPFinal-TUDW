"use client";
import { useState, useEffect } from "react";
import api from "../../../../api/index";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfilSchema, ProfileData } from "../../../../schemas/editProfile";
import { Button, TextField, Container, Paper, Typography, Box } from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Autocomplete from "@mui/material/Autocomplete";

export default function EditProfilePage() {
  const {
    register,
    handleSubmit,
    control,
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
      country_iso: "",
      city: "",
    },
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser } = useAuth();

  const bioValue = watch("bio") || "";
  const bioLength = bioValue.length;
  const maxBioLength = 160;

  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);

  // observar iso del form
  const countryIso = useWatch({ control, name: "country_iso" });
  // fetch countries 
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await api.get("/countries/list");
        const resData = res.data;

        const countryOptions = resData.map((country: any) => ({
          label: country.name,
          value: country.code,
        }));
        setCountries(countryOptions);
      } catch (err: any) {
        console.error("Error al traer los países", err);
        toast.error("No se pudieron cargar los países.");
      }
    }
    fetchCountries();
  }, []);

 
  useEffect(() => {
    if (!countryIso) {
      setCities([]);
      return;
    }
    (async () => {
      try {
        
        const res = await api.get(`/countries/${countryIso}/city`); // verifica ruta en backend
        const citiesData = res.data;
        setCities(citiesData.map((c: any) => ({ label: c.name, value: c.name })));
      } catch (err: any) {
        console.error("Error al traer las ciudades", err);
        setCities([]);
      }
    })();
  }, [countryIso]);

  // fetch user y form
  useEffect(() => {
    async function fetchMe() {
      setLoading(true);
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        const user = res.data;
        setUserId(user.id);
        setValue("displayname", user.displayname || "");
        setValue("bio", user.bio || "");
        setValue("city", user.city || "");
        if (user.country_iso) setValue("country_iso", user.country_iso.toUpperCase());
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "No autenticado");
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [setValue]);

  const onSubmit = async (data: ProfileData) => {
    if (!userId) return toast.error("No autenticado");
    try {
      const formData = new FormData();
      formData.append("displayname", data.displayname);
      if (data.password && data.password.trim() !== "") formData.append("password", data.password);
      if (data.new_password && data.new_password.trim() !== "") formData.append("new_password", data.new_password);
      if (data.bio && data.bio.trim() !== "") formData.append("bio", data.bio);
      // `profile_picture_url` puede venir como File o FileList (por cómo maneja el input).
      if (data.profile_picture_url instanceof File) {
        formData.append("profile_picture_url", data.profile_picture_url);
      } else if (data.profile_picture_url instanceof FileList && data.profile_picture_url.length > 0) {
        formData.append("profile_picture_url", data.profile_picture_url[0]);
      }
      if (data.city) formData.append("city", data.city);
      if (data.country_iso) formData.append("country_iso", data.country_iso.toUpperCase());

      // No forzamos Content-Type: axios/Browser lo establecerá con el boundary correcto
      const res = await api.put(`/users/${userId}`, formData, { withCredentials: true });

      const updatedUser = res.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        setValue("displayname", updatedUser.displayname ?? "");
        setValue("bio", updatedUser.bio ?? "");
        setValue("profile_picture_url", undefined);
      }

      toast.success("¡Perfil actualizado correctamente!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error de conexión con el servidor.");
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
    <Container maxWidth="lg" sx={{ minHeight: "100vh", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
      
      <Paper elevation={6} sx={{ p: 5, flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: 3, minHeight: "100vh" }}>
        <Typography variant="h3" component="h1" align="center" fontWeight="bold" gutterBottom>
          Editar Perfil
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2.5}>
          <Controller
            name="country_iso"
            control={control}
            render={({ field }) => {
              const selectedOption = countries.find((c) => c.value === field.value) || null;
              return (
                <Autocomplete
                 key={countryIso} 
                  options={countries}
                  getOptionLabel={(opt) => opt.label}
                  isOptionEqualToValue={(option, value) => option.value === value?.value}
                  value={selectedOption}
                  onChange={(_, selected) => {
                    const iso = selected?.value || "";
                    field.onChange(iso); 
                    setValue("city", "");
                  }}
                  renderInput={(params) => <TextField {...params} label="País" />}
                />
              );
            }}
          />

          {/* Ciudad */}
          <Controller
            name="city"
            control={control}
            render={({ field }) => {
              const selectedCity = cities.find((c) => c.value === field.value) || null;
              return (
                <Autocomplete
                  options={cities}
                  getOptionLabel={(opt) => opt.label}
                  isOptionEqualToValue={(option, value) => option.value === value?.value}
                  value={selectedCity}
                  onChange={(_, selected) => field.onChange(selected?.value || "")}
                  renderInput={(params) => <TextField {...params} label="Ciudad" />}
                />
              );
            }}
          />

          <TextField label="Nombre de Usuario" fullWidth {...register("displayname")} error={!!errors.displayname} helperText={errors.displayname?.message} />

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Bio</Typography>
              <Typography variant="caption" color={bioLength > maxBioLength ? "error" : "text.secondary"}>
                {bioLength}/{maxBioLength}
              </Typography>
            </Box>
            <TextField label="Bio" fullWidth {...register("bio")} error={!!errors.bio} helperText={errors.bio?.message || (bioLength > maxBioLength ? "Has superado el máximo de 160 caracteres" : "")} />
          </Box>

          <TextField label="Contraseña anterior" fullWidth {...register("password")} error={!!errors.password} helperText={errors.password?.message} />
          <TextField label="Nueva contraseña" fullWidth {...register("new_password")} error={!!errors.new_password} helperText={errors.new_password?.message} />

          <label htmlFor="profile_picture_url">Elija una foto de perfil:</label>
          <input type="file" id="profile_picture_url" {...register("profile_picture_url")} accept="image/png, image/jpeg" />
          {errors.profile_picture_url && <p className="text-red-600">{errors.profile_picture_url.message as string}</p>}

          <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting} sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
