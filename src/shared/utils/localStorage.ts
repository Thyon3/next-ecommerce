export const getRecentlyViewed = (): string[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("recentlyViewed");
    return stored ? JSON.parse(stored) : [];
};

export const addRecentlyViewed = (productId: string) => {
    if (typeof window === "undefined") return;
    const viewed = getRecentlyViewed();
    const filtered = viewed.filter((id) => id !== productId);
    const updated = [productId, ...filtered].slice(0, 10); // Keep last 10
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
};
