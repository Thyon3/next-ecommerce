"use client";

import React, { useEffect, useState } from "react";

const RevenueChart = () => {
    const [data, setData] = useState<{ date: string, revenue: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const res = await fetch("/api/admin/analytics/revenue");
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching revenue", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenue();
    }, []);

    if (loading) return <div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />;
    if (data.length === 0) return null;

    const maxRevenue = Math.max(...data.map(d => d.revenue)) || 1000;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-8">Revenue (Last 7 Days)</h3>
            <div className="flex items-end justify-between h-48 gap-2">
                {data.map((item, index) => {
                    const heightPercent = (item.revenue / maxRevenue) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                {item.revenue.toLocaleString()}€
                            </div>

                            <div
                                className="w-full bg-bitex-blue-500/20 hover:bg-bitex-blue-500 rounded-t-lg transition-all duration-500 cursor-pointer relative overflow-hidden"
                                style={{ height: `${Math.max(heightPercent, 5)}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-bitex-blue-600/40 to-transparent" />
                            </div>
                            <span className="text-[10px] text-gray-400 mt-2 rotate-45 sm:rotate-0">
                                {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RevenueChart;
