"use client"
import { Input } from "@heroui/react";
import { FieldError } from "react-hook-form";

interface FormInputProps {
  label: string;
  error?: FieldError;
  type?: string;
  register: any;
  name: string;
  
}

export default function FormInput({
  label,
  error,
  type = "text",
  register,
  name,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Input
        label={label}
        type={type}
        {...register(name)}
        isInvalid={!!error}
        errorMessage={error?.message}
        variant="bordered"
        labelPlacement="outside"
        radius="lg"
        classNames={{
          base: "w-full",
          label: "text-sm font-medium text-gray-700",
          input: "text-base",
          
          inputWrapper: [
            "border border-gray-300",
            "transition-colors",
             "data-[focus=true]:border-blue-600",

      "data-[invalid=true]:border-red-500"
          ],
          errorMessage: "text-sm text-red-500"
        }}
      />
    </div>
  );
}
