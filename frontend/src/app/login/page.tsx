"use client"

import AuthForm from "@/components/AuthForm"
import toast from "react-hot-toast"

export default function LoginPage(){
    const handleLogin = async (data: Record<string, string>)=>{
        try{
            const res = await fetch("http://localhost:4000/api/users/login",{
                method: "POST",
                credentials : "include",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(data)
            }
            );
            if(!res.ok) throw new Error("Error en el login");
            toast.success("Login exitoso :)")
        }catch(error: any){
             toast.error("❌ " + error.message);
        }
    }
    return(
        <div className="flex flex-col justify-center items-center">
        <AuthForm
        title="Inciar Sesión"
        fields ={[
            {name: "identifier", label:"Email o Usuario"},
            {name: "password", label: "Contraseña", type: "password"}
        ]}
        onSubmit={handleLogin}
        />
           <a
              href="/register"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-38 text-center"
            >
              Registrarse
            </a>
        </div>
    )
}