"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/styling";

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
};

export const Tooltip = ({ children, content, position = "top" }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded whitespace-nowrap",
            positionClasses[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
