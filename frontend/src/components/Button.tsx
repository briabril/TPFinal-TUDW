"use client";

type ButtonProps ={
    children: React.ReactNode;
    onClick? : () => void;
    type?: "button" | "submit";
    variant?: "primary" | "secondary";
    disabled?: boolean;
};

const Button : React.FC<ButtonProps> = ({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
}) => {
    const base = "px-4 py-2 rounded-lg font-medium transition-colors w-full cursor-pointer"
      const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
};

export default Button;
