
import { cn } from "@/shared/utils/styling";

type BadgeProps = {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "outline";
    className?: string;
};

const Badge = ({ children, variant = "default", className }: BadgeProps) => {
    const variants = {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        outline: "bg-transparent border border-gray-200 text-gray-600",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};

export default Badge;
