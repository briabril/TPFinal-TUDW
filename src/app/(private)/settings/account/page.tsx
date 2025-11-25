"use client";

import { useState, useEffect } from "react";
import api from "../../../../api/index";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfilSchema, ProfileData } from "../../../../schemas/editProfile";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import toast from "react-hot-toast";
import AvatarCropper from "@/components/AvatarCropper";
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
  const [countries, setCountries] = useState<
    { label: string; value: string }[]
  >([]);

  const countryIso = useWatch({ control, name: "country_iso" });

  // Fetch countries
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await api.get("/countries/list");
        const countryOptions = res.data.map((country: any) => ({
          label: country.name,
          value: country.code,
        }));
        setCountries(countryOptions);
      } catch (err: any) {
        toast.error("No se pudieron cargar los países.");
      }
    }
    fetchCountries();
  }, []);

  // Fetch cities when ISO changes
  useEffect(() => {
    if (!countryIso) return setCities([]);

    (async () => {
      try {
        const res = await api.get(`/countries/${countryIso}/city`);
        setCities(res.data.map((c: any) => ({ label: c.name, value: c.name })));
      } catch {
        setCities([]);
      }
    })();
  }, [countryIso]);

  // Fetch user data
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
        if (user.country_iso)
          setValue("country_iso", user.country_iso.toUpperCase());
      } catch (err: any) {
        toast.error("No autenticado");
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [setValue]);

  // Submit
  const onSubmit = async (data: ProfileData) => {
    if (!userId) return toast.error("No autenticado");

    try {
      const formData = new FormData();
      formData.append("displayname", data.displayname);

      if (data.password?.trim()) formData.append("password", data.password);
      if (data.new_password?.trim())
        formData.append("new_password", data.new_password);
      if (data.bio?.trim()) formData.append("bio", data.bio);

      if (data.profile_picture_url instanceof File) {
        formData.append("profile_picture_url", data.profile_picture_url);
      }

      if (data.city) formData.append("city", data.city);
      if (data.country_iso)
        formData.append("country_iso", data.country_iso.toUpperCase());

      const res = await api.put(`/users/${userId}`, formData, {
        withCredentials: true,
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
      toast.error("Error actualizando el perfil.");
    }
  };

  // Avatar cropper
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const url = URL.createObjectURL(f);
    setImageSrc(url);
    setCropOpen(true);
    e.currentTarget.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-lg">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: "620px",
          borderRadius: 4,
        }}
      >
        <Typography variant="h4" align="center" fontWeight="bold" mb={2}>
          Editar Perfil
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2.3}
        >
          {/* País */}
          <Controller
            name="country_iso"
            control={control}
            render={({ field }) => {
              const selected = countries.find((c) => c.value === field.value) || null;
              return (
                <Autocomplete
                  key={countryIso}
                  options={countries}
                  getOptionLabel={(opt) => opt.label}
                  isOptionEqualToValue={(a, b) => a.value === b?.value}
                  value={selected}
                  onChange={(_, s) => {
                    const iso = s?.value || "";
                    field.onChange(iso);
                    setValue("city", "");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="País" fullWidth />
                  )}
                />
              );
            }}
          />

          {/* Ciudad */}
          <Controller
            name="city"
            control={control}
            render={({ field }) => {
              const selected =
                cities.find((c) => c.value === field.value) ||
                (field.value
                  ? { label: field.value, value: field.value }
                  : null);

              return (
                <Autocomplete
                  freeSolo
                  options={cities}
                  value={selected}
                  getOptionLabel={(opt) =>
                    typeof opt === "string" ? opt : opt.label
                  }
                  isOptionEqualToValue={(a, b) => a.value === b?.value}
                  onChange={(_, s) => field.onChange((s as any)?.value || "")}
                  onInputChange={(_, input) => field.onChange(input)}
                  renderInput={(params) => (
                    <TextField {...params} label="Ciudad" fullWidth />
                  )}
                />
              );
            }}
          />

          {/* Nombre */}
          <TextField
            label="Nombre de usuario"
            fullWidth
            {...register("displayname")}
            error={!!errors.displayname}
            helperText={errors.displayname?.message}
          />

          {/* Bio */}
          <Box>
            <Box display="flex" justifyContent="flex-end">
              <Typography
                variant="caption"
                color={bioLength > maxBioLength ? "error" : "text.secondary"}
              >
                {bioLength}/{maxBioLength}
              </Typography>
            </Box>
            <TextField
              label="Bio"
              fullWidth
              multiline
              minRows={3}
              {...register("bio")}
              error={!!errors.bio}
              helperText={
                errors.bio?.message ||
                (bioLength > maxBioLength &&
                  "Has superado el máximo de 160 caracteres")
              }
            />
          </Box>

          {/* Passwords */}
          <TextField
            label="Contraseña anterior"
            type="password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="Nueva contraseña"
            type="password"
            fullWidth
            {...register("new_password")}
            error={!!errors.new_password}
            helperText={errors.new_password?.message}
          />

          {/* Imagen */}
          <label htmlFor="profile_picture_url">
            Foto de perfil (opcional):
          </label>
          <input
            type="file"
            id="profile_picture_url"
            accept="image/png, image/jpeg"
            onChange={handleFileSelect}
          />

          <AvatarCropper
            open={cropOpen}
            imageSrc={imageSrc}
            onClose={() => {
              setCropOpen(false);
              if (imageSrc) URL.revokeObjectURL(imageSrc);
            }}
            onCropped={(file) => {
              setValue("profile_picture_url", file);
              toast.success("Imagen lista para guardar");
            }}
          />

          {/* Botón */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 2, py: 1.6, fontWeight: 700, borderRadius: 2 }}
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
