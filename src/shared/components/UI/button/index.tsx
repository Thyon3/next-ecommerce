"use client";

import { Spinner } from "@/shared/components/icons/svgIcons";
import { cn } from "@/shared/utils/styling";
import { ButtonHTMLAttributes } from "react"; // Added import for ButtonHTMLAttributes

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent";
  size?: "medium" | "small" | "large";
  isLoading?: boolean;
}

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400",
  accent: "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800",
};

const sizes = {
  small: "px-3 py-1 text-sm",
  medium: "px-4 py-2 text-base",
  large: "px-5 py-3 text-lg",
};

const Button = ({ children, className, variant = "primary", size = "medium", isLoading = false, disabled, ...props }: IProps) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        "flex cursor-pointer bg-white border border-gray-300 items-center justify-center px-4 py-2 transition-all gap-4 duration-300 text-gray-700 rounded-lg disabled:cursor-default hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-100",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
