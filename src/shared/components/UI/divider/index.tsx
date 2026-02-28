import { cn } from "@/shared/utils/styling";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
  text?: string;
};

export const Divider = ({ orientation = "horizontal", className, text }: DividerProps) => {
  if (text) {
    return (
      <div className={cn("flex items-center my-4", className)}>
        <div className="flex-1 border-t border-gray-300" />
        <span className="px-4 text-sm text-gray-500">{text}</span>
        <div className="flex-1 border-t border-gray-300" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        orientation === "horizontal" ? "w-full h-px border-t" : "h-full w-px border-l",
        "border-gray-300",
        className
      )}
    />
  );
};
