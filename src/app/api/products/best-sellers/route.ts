import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "5");

        const bestSellers = await db.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: limit,
        });

        const products = await db.product.findMany({
            where: {
                id: {
                    in: bestSellers.map(item => item.productId),
                },
            },
            include: {
                category: true,
                brand: true,
            },
        });

        // Map the totals back to the products
        const result = products.map(product => ({
            ...product,
            totalSold: bestSellers.find(item => item.productId === product.id)?._sum.quantity || 0,
        })).sort((a, b) => b.totalSold - a.totalSold);

        return NextResponse.json(result);
    } catch (error) {
        console.log("[BEST_SELLERS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
