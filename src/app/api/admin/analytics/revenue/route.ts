import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== Role.ADMIN) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get daily revenue for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const orders = await db.order.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                },
                status: {
                    not: 'CANCELLED'
                }
            },
            select: {
                totalAmount: true,
                createdAt: true
            }
        });

        // Group by day
        const dailyRevenue: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            dailyRevenue[dateString] = 0;
        }

        orders.forEach(order => {
            const dateString = order.createdAt.toISOString().split('T')[0];
            if (dailyRevenue[dateString] !== undefined) {
                dailyRevenue[dateString] += order.totalAmount;
            }
        });

        const chartData = Object.entries(dailyRevenue)
            .map(([date, amount]) => ({
                date,
                revenue: amount
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json(chartData);
    } catch (error) {
        console.log("[ANALYTICS_REVENUE_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
