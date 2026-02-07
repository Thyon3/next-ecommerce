"use client";

import React, { useEffect, useState } from "react";

const LogsPage = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [type, setType] = useState<"audit" | "stock">("audit");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/logs?type=${type}`);
                const data = await res.json();
                setLogs(data);
            } catch (error) {
                console.error("Error fetching logs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [type]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">System Logs</h1>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setType("audit")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'audit' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setType("stock")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'stock' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Stock Logs
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-medium font-bold">
                            <th className="px-6 py-4">{type === 'audit' ? 'Action' : 'Product'}</th>
                            <th className="px-6 py-4">{type === 'audit' ? 'User' : 'Change'}</th>
                            <th className="px-6 py-4">{type === 'audit' ? 'Details' : 'Reason'}</th>
                            <th className="px-6 py-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {type === 'audit' ? log.action : log.product?.name}
                                </td>
                                <td className="px-6 py-4">
                                    {type === 'audit' ? (
                                        <div className="flex flex-col">
                                            <span className="font-medium">{log.user?.name}</span>
                                            <span className="text-[10px] text-gray-400">{log.user?.email}</span>
                                        </div>
                                    ) : (
                                        <span className={`font-mono ${log.newStock > log.oldStock ? 'text-green-600' : 'text-red-600'}`}>
                                            {log.oldStock} → {log.newStock}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                                    {type === 'audit' ? log.details : log.reason}
                                </td>
                                <td className="px-6 py-4 text-gray-400 text-[10px] font-mono whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {!loading && logs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No logs found.</td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-400">Loading logs...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogsPage;
