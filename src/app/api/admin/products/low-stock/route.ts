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
        const threshold = parseInt(searchParams.get("threshold") || "5");

        const lowStockProducts = await db.product.findMany({
            where: {
                stock: {
                    lte: threshold,
                },
            },
            include: {
                category: true,
                brand: true,
            },
            orderBy: {
                stock: "asc",
            },
        });

        return NextResponse.json(lowStockProducts);
    } catch (error) {
        console.log("[ADMIN_LOW_STOCK_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
