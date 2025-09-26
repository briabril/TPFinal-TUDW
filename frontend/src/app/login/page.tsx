"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { loginData, loginSchema } from "@/schemas/loginSchema";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<loginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: loginData) => {
    try {
      await api.post("/users/login", data);
      toast.success("Login exitoso 🎉");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error en el login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 flex flex-col gap-6"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Iniciar Sesión
        </h1>

        <FormInput
          label="Email o Usuario"
          name="identifier"
          register={register}
          error={errors.identifier}
        />

        <FormInput
          label="Contraseña"
          type="password"
          name="password"
          register={register}
          error={errors.password}
        />

        <Button
          label="Ingresar"
          type="submit"
          loading={isSubmitting}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
        />
      </form>
    </div>
  );
}
