"use client";

import React, { useEffect, useState } from 'react';
import Badge from '@/shared/components/UI/Badge';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const cancelOrder = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' });
            if (res.ok) {
                // Refresh orders
                const updatedRes = await fetch('/api/orders');
                const updatedData = await updatedRes.json();
                setOrders(updatedData);
            }
        } catch (error) {
            console.error("Error cancelling order", error);
        }
    };

    if (loading) return <div className="mt-40 storeContainer">Loading your orders...</div>;

    return (
        <div className="mt-40 storeContainer min-h-screen pb-20">
            <h1 className="text-3xl font-light text-gray-900 mb-10">Order History</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 bg-gray-50 flex flex-wrap justify-between items-center gap-4 border-b">
                                <div className="flex gap-10">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Order Placed</p>
                                        <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Total Amount</p>
                                        <p className="text-sm font-bold">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">ORDER # {order.id.slice(-12).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-col gap-6">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-20 h-20 rounded bg-gray-100 overflow-hidden shrink-0">
                                                <img src={`/images/images/productImages/${item.product.images[0]}`} alt={item.product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                                <p className="text-sm font-semibold mt-2">${item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex flex-col gap-2 justify-center">
                                                <button className="text-xs px-4 py-2 border rounded hover:bg-gray-50">Track Package</button>
                                                <button className="text-xs px-4 py-2 border rounded hover:bg-gray-50">Write Review</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {order.status === 'PENDING' && (
                                    <div className="mt-8 pt-6 border-t flex justify-end">
                                        <button
                                            onClick={() => cancelOrder(order.id)}
                                            className="text-sm text-red-600 font-medium hover:underline"
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
