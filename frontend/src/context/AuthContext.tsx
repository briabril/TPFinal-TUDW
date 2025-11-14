"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import api from "@tpfinal/api"
import type { User } from "@tpfinal/types"

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
  const fetchUser = async () => {
    try {
      const res = await api.get<User>("/auth/me", { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  fetchUser();
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


