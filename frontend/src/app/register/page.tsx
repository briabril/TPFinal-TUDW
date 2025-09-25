"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";
import  Button  from "@/components/Button";
import toast from "react-hot-toast"
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterData } from "@/schemas/registerSchema";


export default function RegisterPage(){
     const router = useRouter();
     const {
        register,
        handleSubmit,
        formState : {errors, isSubmitting}
     } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema)
     })
  
    const onSubmit = async (data: RegisterData)=>{
        try{
            await api.post("/users/register", data);
            toast.success("Registro exitososo! Revisa tu correo")
            router.push("/checkEmail");
        }catch(err: any){
            toast.error(err.response?.data?.error || "Error en el registro")
        }
    }
    return(
        <form
       
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-sm mx-auto flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">Crear Cuenta</h1>
         <FormInput
        label="Usuario"
        name="username"
        register={register}
        error={errors.username}
      />
      <FormInput
        label="Correo electrónico"
        name="email"
        type="email"
        register={register}
        error={errors.email}
      />
      <FormInput
        label="Nombre a mostrar"
        name="displayname"
        register={register}
        error={errors.displayname}
      />
      <FormInput
        label="Contraseña"
        type="password"
        name="password"
        register={register}
        error={errors.password}
      />
      <Button label="Registrarse" type="submit" loading={isSubmitting} />
        </form>
    )

}