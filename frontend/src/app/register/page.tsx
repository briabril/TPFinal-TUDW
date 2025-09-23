"use client"

import AuthForm from "@/components/AuthForm";
import toast from "react-hot-toast"

export default function RegisterPage(){
    const handleRegister = async (data: Record<string, string>) => {
        try{
            const res = await fetch("http://localhost:4000/api/users/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            });

            if(!res.ok) throw new Error("Error en el registro")
                toast.success("✅ Usuario registrado con éxito");
        }
        catch(err: any){
            toast.error("❌ " + err.message);
        }
    }
    return(
        <AuthForm
        title="Registrarse"
        fields={[
            {name: "username", label: "Nombre de usuario"},
            {name: "email", label: "Correo electrónico", type: "email"},
            {name: "displayname", label: "Nombre a mostrar"},
            {name: "password", label: "Contraseña", type: "password"},
        ]}
        onSubmit={handleRegister}
        />
    )

}