"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/Button";

export default function Home() {
const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true);
const router = useRouter();
useEffect (()=>{
  
    const fetchMe = async () =>{
      try{
         const res = await fetch("http://localhost:4000/api/users/me",{
        credentials: "include"
      });
       if(!res.ok){
        setUser(null)
       }else{
        const data = await res.json();
        setUser(data)
       }
      }catch(err){
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
     
    }
   fetchMe()
 
}, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users/logout", {
        method: "POST",
        credentials: "include", 
      });
      if (!res.ok) throw new Error("Error al cerrar sesión");
      toast.success("👋 Sesión cerrada");
      window.location.href = "/login"; 
    } catch (err: any) {
      toast.error("❌ " + err.message);
    }
  };

  return (
    user ? (<><h1>Hola {user.displayname}!</h1>
    <Button onClick={handleLogout}>Cerrar Sesión</Button>
    </>):(<><h1>No has iniciado sesión</h1>
    <div className="flex gap-4 mt-4 justify-center">
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Iniciar sesión
            </a>
            <a
              href="/register"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Crear Cuenta
            </a>
          </div>
          </>)
  );
}
