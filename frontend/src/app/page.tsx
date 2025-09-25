"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
export default function Home() {
const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true);
const router = useRouter();
useEffect (()=>{
  
    const fetchMe = async () =>{
      try{
        const res =await api.get("/users/me", {withCredentials:true})
        setUser(res.data);
      }catch(err: any){
        toast.error(err.response?.data?.error || "Error al traer al usuario");
        setUser(null);
      } finally {
        setLoading(false);
      }
     
    }
   fetchMe()
 
}, []);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout",  {}, { withCredentials: true })
      toast.success("👋 Sesión cerrada");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    }
  };
if (loading) return <p>Cargando...</p>;
  return (
    user ? (<><h1>Hola {user.displayname}!</h1>
    <Button label= "Cerrar Sesión" type= "button" onClick={handleLogout}/>
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
