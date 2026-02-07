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

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "audit"; // "audit" or "stock"

        if (type === "stock") {
            const logs = await db.stockLog.findMany({
                include: {
                    product: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });
            return NextResponse.json(logs);
        }

        const logs = await db.auditLog.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.log("[LOGS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
