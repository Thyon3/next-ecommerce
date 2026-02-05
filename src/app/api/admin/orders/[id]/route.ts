import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any)?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        if (!params.id) {
            return new NextResponse("Order ID is required", { status: 400 });
        }

        if (!status) {
            return new NextResponse("Status is required", { status: 400 });
        }

        const order = await db.order.update({
            where: {
                id: params.id,
            },
            data: {
                status,
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.log("[ADMIN_ORDER_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
