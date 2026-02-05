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

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || undefined;

        const orders = await db.order.findMany({
            where: {
                status: status as any,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.log("[ADMIN_ORDERS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
