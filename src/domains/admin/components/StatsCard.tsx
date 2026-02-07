import React from 'react';
import { cn } from "@/shared/utils/styling";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    description?: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
    className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    description,
    trend,
    className
}) => {
    return (
        <div className={cn("bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow", className)}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                {icon && (
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                        {icon}
                    </div>
                )}
            </div>

            {(description || trend) && (
                <div className="flex items-center gap-2 mt-2">
                    {trend && (
                        <span className={cn(
                            "text-xs font-bold px-1.5 py-0.5 rounded",
                            trend.isUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                        )}>
                            {trend.isUp ? "+" : "-"}{Math.abs(trend.value)}%
                        </span>
                    )}
                    {description && <p className="text-xs text-gray-400">{description}</p>}
                </div>
            )}
        </div>
    );
};

export default StatsCard;
