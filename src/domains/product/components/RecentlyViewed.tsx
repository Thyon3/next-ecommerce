"use client";

import React, { useEffect, useState } from "react";
import { getRecentlyViewed } from "@/shared/utils/localStorage";
import { getCartProducts } from "@/actions/product/product";
import ProductCard from "@/domains/product/components/productCard";
import { TCartListItemDB } from "@/shared/types/product";

const RecentlyViewed = () => {
    const [products, setProducts] = useState<TCartListItemDB[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            const ids = getRecentlyViewed();
            if (ids.length === 0) {
                setLoading(false);
                return;
            }

            const response = await getCartProducts(ids);
            if (response.res) {
                // Sort by the order in the IDs array
                const sorted = response.res.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
                setProducts(sorted);
            }
            setLoading(false);
        };

        fetchRecentlyViewed();
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <div className="w-full my-[60px]">
            <h2 className="font-light block text-2xl text-gray-900 mb-6">Recently Viewed</h2>
            <div className="flex justify-start gap-4 w-full overflow-x-auto pb-4">
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
                        staticWidth
                    />
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
