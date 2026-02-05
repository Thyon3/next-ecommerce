"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/utils/styling";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    className?: string;
}

const AuthLayout = ({ children, title, subtitle, className }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/">
                        <Image
                            src="/images/logo.png"
                            alt="Thyonx Logo"
                            width={150}
                            height={48}
                            quality={100}
                            className="mb-6 cursor-pointer"
                        />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    <p className="mt-2 text-gray-500 text-center">{subtitle}</p>
                </div>
                <div className={cn("bg-white border border-gray-100 shadow-2xl rounded-3xl p-8 md:p-10", className)}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
