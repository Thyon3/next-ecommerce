"use client";

import React, { useEffect, useState } from 'react';
import ProductCard from '@/domains/product/components/productCard';
import { IMAGE_BASE_URL } from '@/shared/constants/store';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist');
            const data = await res.json();
            setWishlist(data);
        } catch (error) {
            console.error("Error fetching wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (productId: string) => {
        try {
            await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
            fetchWishlist();
        } catch (error) {
            console.error("Error removing from wishlist", error);
        }
    };

    if (loading) return <div className="mt-40 storeContainer">Loading wishlist...</div>;

    return (
        <div className="mt-40 storeContainer min-h-screen">
            <h1 className="text-3xl font-light text-gray-900 mb-10">My Wishlist</h1>

            {wishlist.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Your wishlist is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map((item: any) => (
                        <div key={item.product.id} className="relative group">
                            <ProductCard
                                id={item.product.id}
                                imgUrl={item.product.images.map((img: string) => `/images/images/productImages/${img}`)}
                                name={item.product.name}
                                price={item.product.price}
                                isAvailable={item.product.isAvailable}
                                dealPrice={item.product.salePrice || undefined}
                                specs={item.product.specialFeatures}
                                url={"/product/" + item.product.id}
                            />
                            <button
                                onClick={() => removeFromWishlist(item.product.id)}
                                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove from wishlist"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
