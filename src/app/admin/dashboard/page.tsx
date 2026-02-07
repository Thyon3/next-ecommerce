"use client";

import React, { useEffect, useState } from 'react';
import StatsCard from '@/domains/admin/components/StatsCard';
import RevenueChart from '@/domains/admin/components/RevenueChart';

interface DashboardStats {
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalRevenue: number;
    recentOrders: any[];
}

const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center text-gray-500 mt-10">Failed to load dashboard statistics.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    description="Lifetime sales"
                    trend={{ value: 12, isUp: true }}
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    description="Successful transactions"
                    trend={{ value: 8, isUp: true }}
                />
                <StatsCard
                    title="Total Products"
                    value={stats.totalProducts}
                    description="Active listings"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    description="Registered accounts"
                    trend={{ value: 5, isUp: true }}
                />
            </div>

            <RevenueChart />

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <button className="text-sm font-medium text-black hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-medium">
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentOrders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id.slice(-6)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{order.user.name}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.totalAmount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {stats.recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
