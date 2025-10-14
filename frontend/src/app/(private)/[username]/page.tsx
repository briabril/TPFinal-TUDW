"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@tpfinal/api";
import { useAuth } from "@/context/AuthContext";
import { User } from "@tpfinal/types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import BlockStatusMessage from "@/components/profile/BlockStatusMessage";
import { Alert, AlertTitle, CircularProgress } from "@mui/material";

interface BlockStatus {
  blockedByYou: boolean;
  blockedByThem: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockStatus, setBlockStatus] = useState<BlockStatus>({
    blockedByYou: false,
    blockedByThem: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<User>(`/users/by-username/${username}`, {
          withCredentials: true,
        });
        setProfile(res.data);

        if (user && res.data.id !== user.id) {
          const statusRes = await api.get<BlockStatus>(
            `/blocks/${res.data.id}/status`,
            { withCredentials: true }
          );
          setBlockStatus(statusRes.data);
        }
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 403) {
          setError("No puedes ver este perfil porque estás bloqueado.");
        } else if (status === 404) {
          setError("El usuario no existe.");
        } else {
          setError("Ocurrió un error al cargar el perfil.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username, user]);

  const handleUnblock = async () => {
    if (!profile) return;
    await api.post(`/blocks/${profile.id}/unblock`, {}, { withCredentials: true });
    setBlockStatus({ ...blockStatus, blockedByYou: false });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </div>
    );

  if (!profile)
    return (
      <div className="p-6">
        <Alert severity="warning">
          <AlertTitle>Atención</AlertTitle>
          No se encontró el perfil.
        </Alert>
      </div>
    );

  const isOwnProfile = !!(user && profile.id === user.id);

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        blockStatus={blockStatus}
        setBlockStatus={setBlockStatus}
      />
      <BlockStatusMessage
        blockStatus={blockStatus}
        profile={profile}
        onUnblock={handleUnblock}
      />

      {!blockStatus.blockedByYou &&
        !blockStatus.blockedByThem &&
        !loading && <p>los posts del usuario </p>}
    </div>
  );
}
