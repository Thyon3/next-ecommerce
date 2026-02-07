"use client";

import React, { useEffect, useState } from "react";

interface ReturnRequest {
    id: string;
    orderId: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: string;
    order: {
        totalAmount: number;
        user: {
            name: string;
            email: string;
        }
    }
}

const ReturnsPage = () => {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const res = await fetch("/api/admin/returns");
                const data = await res.json();
                setReturns(data);
            } catch (error) {
                console.error("Error fetching returns", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReturns();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        // Implement status update API call here
        console.log(`Updating ${id} to ${status}`);
    };

    if (loading) return <div className="p-8">Loading return requests...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-8">Return & Refund Requests</h1>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-medium font-bold">
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Requested At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {returns.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors text-sm">
                                <td className="px-6 py-4 font-medium text-gray-900">#{req.orderId.slice(-6)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{req.order.user.name}</span>
                                        <span className="text-[10px] text-gray-400">{req.order.user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={req.details || ""}>
                                    {req.reason}
                                </td>
                                <td className="px-6 py-4 font-bold">{req.order.totalAmount.toLocaleString()}€</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            req.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                                req.status === 'REFUNDED' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-[10px]">
                                    {new Date(req.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {returns.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">No return requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReturnsPage;
