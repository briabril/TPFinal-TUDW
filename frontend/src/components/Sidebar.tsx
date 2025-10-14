"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Button,
  Divider,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Home,
  User,
  MessageSquare,
  Settings,
  PenSquare,
  LayoutDashboard,
  Users,
  Flag,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const { user, loading, logout } = useAuth();
  if (loading) return <h1 className="text-center py-10 text-lg">Cargando...</h1>;

  return (
    <aside className="sticky top-0 w-64 h-screen shadow p-6 flex flex-col justify-between bg-white">
      <div>
        <h2 className="font-bold text-2xl mb-8 text-primary">La Red</h2>

        <List>
          <ListItemButton component={Link} href="/">
            <ListItemIcon>
              <Home className="w-4 h-4" />
            </ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItemButton>

          <ListItemButton component={Link} href={`/${user?.username}`}>
            <ListItemIcon>
              <User className="w-4 h-4" />
            </ListItemIcon>
            <ListItemText primary="Perfil" />
          </ListItemButton>

          <ListItemButton component={Link} href="/messages">
            <ListItemIcon>
              <MessageSquare className="w-4 h-4" />
            </ListItemIcon>
            <ListItemText primary="Mensajes" />
          </ListItemButton>

          <ListItemButton component={Link} href="/settings">
            <ListItemIcon>
              <Settings className="w-4 h-4" />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItemButton>

          <ListItemButton component={Link} href="/posts/create">
            <ListItemIcon>
              <PenSquare className="w-4 h-4" />
            </ListItemIcon>
            <ListItemText primary="Postear" />
          </ListItemButton>
        </List>

        {user?.role === "ADMIN" && (
          <>
            <Divider sx={{ my: 2 }} />
            <h3 className="text-sm font-semibold mb-2">Admin</h3>

            <List>
              <ListItemButton component={Link} href="/admin/dashboard">
                <ListItemIcon>
                  <LayoutDashboard className="w-4 h-4" />
                </ListItemIcon>
                <ListItemText primary="Panel Admin" />
              </ListItemButton>

              <ListItemButton component={Link} href="/admin/users">
                <ListItemIcon>
                  <Users className="w-4 h-4" />
                </ListItemIcon>
                <ListItemText primary="Gestión de usuarios" />
              </ListItemButton>

              <ListItemButton component={Link} href="/admin/reports">
                <ListItemIcon>
                  <Flag className="w-4 h-4" />
                </ListItemIcon>
                <ListItemText primary="Reportes" />
              </ListItemButton>
            </List>
          </>
        )}
      </div>

      {user && (
        <div className="flex items-center justify-between mt-6 p-2 rounded-xl ">
          <div className="flex items-center gap-2">
            <Avatar
              src={user.profile_picture_url ?? undefined}
              alt={user.displayname ?? user.username}
              sx={{ width: 36, height: 36 }}
            />
            <div>
              <p className="font-semibold leading-tight">{user.displayname}</p>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
          </div>
          <Button onClick={logout} size="small" color="error" variant="text">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      )}
    </aside>
  );
}
