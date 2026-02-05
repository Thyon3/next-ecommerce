"use client";

import React from "react";
import Button from "@/shared/components/UI/button";
import { GoogleIcon, AppleIcon } from "@/shared/components/icons/svgIcons";

const SocialLogins = () => {
    return (
        <div className="flex flex-col gap-3 w-full mt-6">
            <div className="relative flex items-center justify-center mb-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-300"
                    onClick={() => { }}
                >
                    <GoogleIcon width={20} />
                    <span className="font-semibold text-sm">Google</span>
                </Button>
                <Button
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white hover:bg-gray-900 rounded-xl transition-all duration-300"
                    onClick={() => { }}
                >
                    <AppleIcon width={18} fill="white" />
                    <span className="font-semibold text-sm">Apple</span>
                </Button>
            </div>
        </div>
    );
};

export default SocialLogins;
