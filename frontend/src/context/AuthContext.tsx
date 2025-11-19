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
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
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


