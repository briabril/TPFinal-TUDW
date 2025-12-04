"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../api/index";
import { useAuth } from "@/context/AuthContext";
import { User, BlockStatus, FollowStatus } from "../../../types/user";
import ProfileHeader from "@/components/profile/ProfileHeader";
import BlockStatusMessage from "@/components/profile/BlockStatusMessage";
import PostList from "@/components/posts/PostList";
import { Alert, AlertTitle, CircularProgress, Box } from "@mui/material";
import MyPostsTabs from "@/components/posts/MyPostTabs";

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
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    isFollowing: false,
    isFollowedBy: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const res = await api.get<User>(`/users/by-username/${username}`, {
          withCredentials: true,
        });
        const userData = res.data;
        setProfile(userData);
        if (user && userData.id !== user.id) {
          const [blockRes, followRes] = await Promise.all([
            api.get<BlockStatus>(`/blocks/${userData.id}/status`, { withCredentials: true }),
            api.get<FollowStatus>(`/follow/${userData.id}/status`),
          ]);

          setBlockStatus(blockRes.data);
          setFollowStatus(followRes.data);
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

    if (username) fetchProfileData();
  }, [username]);

  const handleUnblock = async () => {
    if (!profile) return;
    try {
      await api.delete(`/blocks/${profile.id}`, { withCredentials: true });
      setBlockStatus({ ...blockStatus, blockedByYou: false });
    } catch (err) {
      console.error("Error al desbloquear:", err);
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box className="p-6">
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );

  if (!profile)
    return (
      <Box className="p-6">
        <Alert severity="warning">
          <AlertTitle>Atención</AlertTitle>
          No se encontró el perfil.
        </Alert>
      </Box>
    );

  const isOwnProfile = !!(user && profile.id === user.id);
const canViewPosts =
  isOwnProfile ||
  followStatus.isFollowing; // ver posts privados

const showPublicPosts =
  !isOwnProfile && !followStatus.isFollowing; // ver públicos

  return (
    <Box className="flex flex-col items-center">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        blockStatus={blockStatus}
        setBlockStatus={setBlockStatus}
        followStatus={followStatus}
        setFollowStatus={setFollowStatus}
      />

      <BlockStatusMessage
        blockStatus={blockStatus}
        profile={profile}
        onUnblock={handleUnblock}
      />

      {!blockStatus.blockedByYou &&
        !blockStatus.blockedByThem &&
        !loading && (
          <>
          

         {isOwnProfile && (
     <MyPostsTabs />
)}

{!isOwnProfile && followStatus.isFollowing && (
  <PostList mode="user" username={username} />
)}

{!isOwnProfile && !followStatus.isFollowing && (
  <>
    <PostList mode="public-user" username={username} />
    <Box className="p-6 text-center text-gray-500">
      Solo las publicaciones públicas están visibles.
    </Box>
  </>
)}
     </>
        )}
    </Box>
  );
}
