import { cn } from "@/shared/utils/styling";

type AlertProps = {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  onClose?: () => void;
};

export const Alert = ({ children, variant = "info", onClose }: AlertProps) => {
  const variantStyles = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    error: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div className={cn("p-4 rounded-lg border flex items-start justify-between", variantStyles[variant])}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
};
