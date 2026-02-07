"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

const LoyaltyPointsDisplay = () => {
    const { data: session } = useSession();
    const [points, setPoints] = useState<number | null>(null);

    useEffect(() => {
        const fetchPoints = async () => {
            if (session) {
                try {
                    const res = await fetch("/api/user/profile");
                    const data = await res.json();
                    setPoints(data.loyaltyPoints);
                } catch (error) {
                    console.error("Error fetching loyalty points", error);
                }
            }
        };

        fetchPoints();
    }, [session]);

    if (!session || points === null) return null;

    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-full border border-yellow-200 ml-2">
            <div className="relative w-4 h-4">
                <Image src="/icons/topSellingIcon.svg" alt="Points" fill className="object-contain" />
            </div>
            <span className="text-xs font-bold text-yellow-700">{points} Pts</span>
        </div>
    );
};

export default LoyaltyPointsDisplay;
