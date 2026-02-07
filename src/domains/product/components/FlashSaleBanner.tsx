"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const FlashSaleBanner = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Mock countdown to midnight
        const timer = setInterval(() => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();

            setTimeLeft({
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden group">
            {/* Animated Background Circles */}
            <div className="absolute -top-20 -right-20 size-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            <div className="absolute -bottom-20 -left-20 size-48 bg-black/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-sm border border-white/30">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <span className="text-[10px] font-bold tracking-widest uppercase">Flash Sale Live</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter">UP TO 70% OFF</h2>
                    <p className="text-red-50 text-sm md:text-base font-medium max-w-sm opacity-90 leading-relaxed">
                        Grab the best tech deals before they vanish. High-performance gaming gear, premium audio, and smartphones at unbeatable prices.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="size-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                                <span className="text-3xl font-black text-red-600">{String(timeLeft.hours).padStart(2, '0')}</span>
                            </div>
                            <span className="text-[10px] mt-2 font-bold opacity-75">HRS</span>
                        </div>
                        <div className="text-3xl font-bold mt-3">:</div>
                        <div className="flex flex-col items-center">
                            <div className="size-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                                <span className="text-3xl font-black text-red-600">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            </div>
                            <span className="text-[10px] mt-2 font-bold opacity-75">MINS</span>
                        </div>
                        <div className="text-3xl font-bold mt-3">:</div>
                        <div className="flex flex-col items-center">
                            <div className="size-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                                <span className="text-3xl font-black text-red-600">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            </div>
                            <span className="text-[10px] mt-2 font-bold opacity-75">SECS</span>
                        </div>
                    </div>

                    <Link
                        href="/list/search?q=sale"
                        className="bg-black hover:bg-gray-900 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all shadow-2xl active:scale-95 group/btn flex items-center gap-2"
                    >
                        Explore Deals
                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FlashSaleBanner;
