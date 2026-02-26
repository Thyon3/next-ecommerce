import { cn } from "@/shared/utils/styling";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  color?: string;
};

export const Spinner = ({ size = "md", color = "text-blue-500" }: SpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent",
        sizeClasses[size],
        color
      )}
    />
  );
};
