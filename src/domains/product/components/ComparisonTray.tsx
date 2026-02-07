"use client";

import React from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/shoppingCart";
import { removeFromComparison, clearComparison } from "@/store/comparison";
import Link from "next/link";

const ComparisonTray = () => {
    const dispatch = useDispatch();
    const comparisonItems = useSelector((state: RootState) => state.comparison.items);

    if (comparisonItems.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white shadow-2xl rounded-2xl border border-gray-200 p-4 flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex -space-x-3 overflow-hidden">
                {comparisonItems.map((item) => (
                    <div key={item.id} className="relative group">
                        <div className="w-14 h-14 rounded-xl border-2 border-white bg-gray-50 overflow-hidden shadow-sm">
                            <Image
                                src={`/images/images/productImages/${item.images[0]}`}
                                alt={item.name}
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                        <button
                            onClick={() => dispatch(removeFromComparison(item.id))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full size-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                {[...Array(4 - comparisonItems.length)].map((_, i) => (
                    <div key={i} className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                        +
                    </div>
                ))}
            </div>

            <div className="h-10 w-[1px] bg-gray-200" />

            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">{comparisonItems.length}/4 selected</span>
                <button
                    onClick={() => dispatch(clearComparison())}
                    className="text-xs text-gray-500 hover:text-red-500 text-left transition-colors"
                >
                    Clear all
                </button>
            </div>

            <Link
                href="/compare"
                className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
                Compare Now
            </Link>
        </div>
    );
};

export default ComparisonTray;
