import { cn } from "@/shared/utils/styling";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
};

export const Card = ({ children, className, padding = "md", hover = false }: CardProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        paddingClasses[padding],
        hover && "transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
};
