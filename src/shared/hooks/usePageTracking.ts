"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PageType } from "@prisma/client";

export const usePageTracking = (type: PageType, productId?: string) => {
    const pathname = usePathname();

    useEffect(() => {
        const recordVisit = async () => {
            try {
                await fetch("/api/analytics/visit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pageType: type,
                        pagePath: pathname,
                        productID: productId,
                        deviceResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : null
                    })
                });
            } catch (error) {
                // Silently fail to not interrupt UX
                console.error("Tracking error", error);
            }
        };

        recordVisit();
    }, [pathname, type, productId]);
};
