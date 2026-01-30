"use client";

import { ButtonHTMLAttributes } from "react";

import { Spinner } from "@/shared/components/icons/svgIcons";
import { cn } from "@/shared/utils/styling";

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
        "rounded-[4px] font-medium transition-colors duration-300 flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed disabled:bg-gray-100",
        className
      )}
    >
      {isLoading && <Spinner width={16} stroke="currentColor" />}
      {children}
    </button>
  );
};

export default Button;
