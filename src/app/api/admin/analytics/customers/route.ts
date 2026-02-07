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

        // Get top spending users
        const topUsers = await db.user.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                loyaltyPoints: true,
                _count: {
                    select: { orders: true }
                },
                orders: {
                    where: {
                        status: { not: 'CANCELLED' }
                    },
                    select: {
                        totalAmount: true
                    }
                }
            }
        });

        const formattedUsers = topUsers.map(user => ({
            id: user.id,
            name: user.name || 'Anonymous',
            email: user.email,
            image: user.image,
            loyaltyPoints: user.loyaltyPoints,
            orderCount: user._count.orders,
            totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount, 0)
        })).sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.log("[ANALYTICS_CUSTOMERS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
