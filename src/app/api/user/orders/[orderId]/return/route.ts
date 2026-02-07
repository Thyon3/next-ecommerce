import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function POST(
    req: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { reason, details } = body;

        if (!reason) {
            return new NextResponse("Reason is required", { status: 400 });
        }

        const order = await db.order.findUnique({
            where: { id: params.orderId }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        // Verify ownership and status (only delivered orders can be returned)
        if (order.status !== 'DELIVERED') {
            return new NextResponse("Only delivered orders can be returned", { status: 400 });
        }

        const returnRequest = await db.returnRequest.create({
            data: {
                orderId: params.orderId,
                reason,
                details
            }
        });

        return NextResponse.json(returnRequest);
    } catch (error) {
        console.log("[ORDER_RETURN_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
