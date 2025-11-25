"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import api from "@/api"
import type { User } from '@/types/user'

type AuthContextType = {
    user: User | null
    loading: boolean
    setUser: (user: User | null) => void
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUserState] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
  
  const normalizeImage = (src: any) => {
    if (!src) return null;
    if (typeof src === "string") return src.trim() || null;
    if (typeof src === "object") {
      if (src.secure_url) return String(src.secure_url);
      if (src.url) return String(src.url);
    }
    return null;
  };

  const setUser = (u: User | null) => {
    if (!u) return setUserState(null);
    try {
      const rawSrc = (u as any).profile_picture_url ?? (u as any).profilePicture ?? (u as any).profile_picture ?? (u as any).profilePic ?? (u as any).picture ?? null;
      const normalized = {
        ...u,
        profile_picture_url: normalizeImage(rawSrc) as any,
      } as User;
      setUserState(normalized);
    } catch {
      setUserState(u);
    }
  };
  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const res = await api.get<User>("/auth/me", { withCredentials: true });
        if (!mounted) return;
        setUser(res.data);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchUser();
    return () => { mounted = false; };
  }, []);


    const logout = async () => {
        try {
            await api.post("/auth/logout", {}, { withCredentials: true });
            setUser(null);
            toast.success("👋 Sesión cerrada");
            router.push("/login");
        } catch {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx
}


