import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any)?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const totalOrders = await db.order.count();
        const totalProducts = await db.product.count();
        const totalUsers = await db.user.count();

        const orders = await db.order.findMany({
            include: {
                items: true,
            },
        });

        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        // Sales by category
        const salesByCategory = await db.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
        });

        // Recent orders
        const recentOrders = await db.order.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            totalOrders,
            totalProducts,
            totalUsers,
            totalRevenue,
            recentOrders,
        });
    } catch (error) {
        console.log("[ADMIN_STATS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
