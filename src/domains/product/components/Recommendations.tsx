"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/domains/product/components/productCard";

const Recommendations = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch("/api/products/recommendations");
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching recommendations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <div className="w-full my-[60px]">
            <h2 className="font-light block text-2xl text-gray-900 mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        imgUrl={[
                            `/images/images/productImages/${product.images[0]}`,
                            `/images/images/productImages/${product.images[1] || product.images[0]}`,
                        ]}
                        name={product.name}
                        price={product.price}
                        isAvailable={product.isAvailable}
                        dealPrice={product.salePrice || undefined}
                        specs={product.specialFeatures || []}
                        url={"/product/" + product.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
