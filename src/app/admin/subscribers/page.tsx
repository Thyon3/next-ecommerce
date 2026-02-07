"use client";

import React, { useEffect, useState } from "react";
import Button from "@/shared/components/UI/button";

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

const SubscribersPage = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                const res = await fetch("/api/admin/subscribers");
                const data = await res.json();
                setSubscribers(data);
            } catch (error) {
                console.error("Error fetching subscribers", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscribers();
    }, []);

    const handleExport = () => {
        const headers = "ID,Email,Status,JoinedAt\n";
        const rows = subscribers.map(s => `${s.id},${s.email},${s.isActive},${s.createdAt}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) return <div className="p-8">Loading subscribers...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
                <Button onClick={handleExport} disabled={subscribers.length === 0}>Export CSV</Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-medium font-bold">
                            <th className="px-6 py-4">Email Address</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subscribers.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors text-sm">
                                <td className="px-6 py-4 font-medium text-gray-900">{sub.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {sub.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {subscribers.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">No subscribers found yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscribersPage;
