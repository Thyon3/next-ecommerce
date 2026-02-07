"use client";

import React, { useEffect, useState } from 'react';
import ProductListItem from '@/domains/admin/components/product/productListItem';
import { TProductListItem } from '@/shared/types/product';

const LowStockPage = () => {
    const [products, setProducts] = useState<TProductListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLowStock = async () => {
        try {
            const res = await fetch('/api/admin/products/low-stock');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching low stock", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLowStock();
    }, []);

    if (loading) return <div className="p-8">Loading low stock alerts...</div>;

    return (
        <div className="flex flex-col p-8">
            <h1 className="text-2xl font-bold mb-8">Low Stock Alerts</h1>

            {products.length === 0 ? (
                <div className="p-12 bg-green-50 text-green-700 rounded-xl border border-green-100 text-center">
                    <p className="font-medium text-lg">Great job!</p>
                    <p className="text-sm">All products have sufficient stock levels.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-4 border border-yellow-200 mb-6">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="text-yellow-800 font-bold">Attention Needed</p>
                            <p className="text-yellow-700 text-sm">{products.length} products are running low on stock (below 10 units).</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {products.map((product) => (
                            <ProductListItem key={product.id} data={product} requestReload={fetchLowStock} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LowStockPage;
