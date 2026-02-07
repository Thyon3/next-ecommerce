"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface CustomerInsight {
    id: string;
    name: string;
    email: string;
    image: string | null;
    loyaltyPoints: number;
    orderCount: number;
    totalSpent: number;
}

const CustomerInsights = () => {
    const [customers, setCustomers] = useState<CustomerInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch("/api/admin/analytics/customers");
                const result = await res.json();
                setCustomers(result);
            } catch (error) {
                console.error("Error fetching customers", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    if (loading) return <div className="w-full h-80 bg-gray-100 animate-pulse rounded-xl" />;
    if (customers.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">Top Customers</h3>
            </div>
            <div className="p-0">
                {customers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                            <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                {customer.image ? (
                                    <Image src={customer.image} alt={customer.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                                        {customer.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900">{customer.name}</span>
                                <span className="text-xs text-gray-500">{customer.email}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-black">{customer.totalSpent.toLocaleString()}€</span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{customer.orderCount} Orders</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerInsights;
