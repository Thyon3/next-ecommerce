"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/styling";

export type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
};

export const Toast = ({ message, type = "info", duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-gray-900",
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 z-50",
        typeStyles[type],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {message}
    </div>
  );
};
