"use client";

import { Button as HeroButton } from "@heroui/react";
import clsx from "clsx";
interface ButtonProps {
  label: string;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  fullWidth?: boolean;
  className? : string;
}

export default function Button({
  label,
  loading = false,
  type = "button",
  onClick,
  fullWidth = true,
  className,
}: ButtonProps) {
  return (
    <HeroButton
      type={type}
      color="primary"
      fullWidth={fullWidth}
      isLoading={loading}
      onClick={onClick}
     className={clsx(
        // estilos por defecto
        "rounded-lg px-4 py-2 font-medium transition-colors",
        "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer",
        // lo que venga desde afuera
        className)}
    >
      {label}
    </HeroButton>
  );
}
