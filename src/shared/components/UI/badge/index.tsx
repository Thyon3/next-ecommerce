import { cn } from "@/shared/utils/styling";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
};

export const Badge = ({ children, variant = "default", size = "md" }: BadgeProps) => {
  const variantStyles = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full font-medium", variantStyles[variant], sizeStyles[size])}>
      {children}
    </span>
  );
};
