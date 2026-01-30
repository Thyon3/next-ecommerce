"use client";

import { useEffect, useState } from "react";

import { ArrowIcon } from "@/shared/components/icons/svgIcons";

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                    aria-label="Back to top"
                >
                    <div className="transform -rotate-180">
                        <ArrowIcon width={12} stroke="currentColor" strokeWidth={2} />
                    </div>
                </button>
            )}
        </>
    );
};

export default BackToTopButton;
