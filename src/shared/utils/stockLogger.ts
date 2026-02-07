import { db } from "@/shared/lib/db";

export const logStockChange = async (productId: string, oldStock: number, newStock: number, reason: string) => {
    try {
        await db.stockLog.create({
            data: {
                productId,
                oldStock,
                newStock,
                reason
            }
        });
    } catch (error) {
        console.error("Failed to log stock change:", error);
    }
};
