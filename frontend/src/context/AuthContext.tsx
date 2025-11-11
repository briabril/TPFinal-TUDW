"use client"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import {AuthProviderBase} from "@tpfinal/context"
import {ReactNode } from "react"


export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();


    return (
        <AuthProviderBase onLogout={()=>{
          toast.success("👋 Sesión cerrada");
            router.push("/login");
        }}>
            {children}
        </AuthProviderBase>
    )
}



