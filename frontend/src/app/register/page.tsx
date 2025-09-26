"use client"

import AuthForm from "@/components/AuthForm";
import toast from "react-hot-toast"
import { useRouter } from "next/navigation";

export default function RegisterPage(){
     const router = useRouter();
    const handleRegister = async (data: Record<string, string>) => {
        try{
            const res = await fetch("http://localhost:4000/api/users/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            });

            if(!res.ok) throw new Error("Error en el registro")
            if (res.ok) {
  router.push("/checkEmail");
}
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