"use client";

import React from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/shoppingCart";
import { removeFromComparison, clearComparison } from "@/store/comparison";
import Button from "@/shared/components/UI/button";
import { useRouter } from "next/navigation";

const ComparePage = () => {
    const comparisonItems = useSelector((state: RootState) => state.comparison.items);
    const dispatch = useDispatch();
    const router = useRouter();

    if (comparisonItems.length === 0) {
        return (
            <div className="mt-40 storeContainer flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <div className="bg-gray-100 p-8 rounded-full mb-6">
                    <Image src="/icons/analytics.svg" alt="Compare" width={64} height={64} className="grayscale opacity-30" />
                </div>
                <h1 className="text-2xl font-light text-gray-900 mb-4">No products selected for comparison</h1>
                <p className="text-gray-500 mb-8">Add up to 4 products to compare their features and prices.</p>
                <Button onClick={() => router.push("/")}>Start Shopping</Button>
            </div>
        );
    }

    return (
        <div className="mt-40 storeContainer min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-light text-gray-900">Product Comparison</h1>
                <button
                    onClick={() => dispatch(clearComparison())}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                >
                    Clear Comparison
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full bg-white border-collapse rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <thead>
                        <tr>
                            <th className="p-6 text-left text-gray-400 font-medium border-b border-r border-gray-100 w-1/5 bg-gray-50/50">Feature</th>
                            {comparisonItems.map((item) => (
                                <th key={item.id} className="p-6 text-center border-b border-r border-gray-100 align-top relative group">
                                    <button
                                        onClick={() => dispatch(removeFromComparison(item.id))}
                                        className="absolute top-2 right-2 size-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                    <div className="relative w-full h-40 mb-4">
                                        <Image
                                            src={`/images/images/productImages/${item.images[0]}`}
                                            alt={item.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="block text-sm font-bold text-gray-900 mb-2">{item.name}</span>
                                    <div className="text-lg font-bold text-black">
                                        {item.salePrice ? (
                                            <div className="flex flex-col">
                                                <span className="text-red-600">{item.salePrice.toLocaleString()}€</span>
                                                <span className="text-xs text-gray-400 line-through font-normal">{item.price.toLocaleString()}€</span>
                                            </div>
                                        ) : (
                                            <span>{item.price.toLocaleString()}€</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {[...Array(4 - comparisonItems.length)].map((_, i) => (
                                <th key={i} className="p-6 border-b border-gray-100 bg-gray-50/30">
                                    <div className="h-40 flex items-center justify-center text-gray-300">
                                        Empty Slot
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 font-medium text-gray-600 border-b border-r border-gray-50 bg-gray-50/30">Stock Status</td>
                            {comparisonItems.map((item) => (
                                <td key={item.id} className="p-4 text-center border-b border-r border-gray-50">
                                    {item.isAvailable ? (
                                        <span className="text-green-600 text-sm font-medium">In Stock</span>
                                    ) : (
                                        <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                                    )}
                                </td>
                            ))}
                            {[...Array(4 - comparisonItems.length)].map((_, i) => <td key={i} className="p-4 border-b border-gray-50" />)}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium text-gray-600 border-b border-r border-gray-50 bg-gray-50/30">Special Features</td>
                            {comparisonItems.map((item) => (
                                <td key={item.id} className="p-4 border-b border-r border-gray-50">
                                    <ul className="text-xs text-gray-600 text-left space-y-1">
                                        {item.specialFeatures.map((feat, idx) => (
                                            <li key={idx} className="flex items-center gap-1.5">
                                                <span className="size-1 bg-gray-400 rounded-full" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            ))}
                            {[...Array(4 - comparisonItems.length)].map((_, i) => <td key={i} className="p-4 border-b border-gray-50" />)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparePage;
