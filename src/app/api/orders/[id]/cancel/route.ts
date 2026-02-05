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

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id || (await db.user.findUnique({ where: { email: session.user?.email || "" } }))?.id;

        if (!params.id) {
            return new NextResponse("Order ID is required", { status: 400 });
        }

        const order = await db.order.findUnique({
            where: {
                id: params.id,
                userId,
            },
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        if (order.status !== "PENDING") {
            return new NextResponse("Only pending orders can be cancelled", { status: 400 });
        }

        const cancelledOrder = await db.order.update({
            where: {
                id: params.id,
            },
            data: {
                status: "CANCELLED",
            },
        });

        return NextResponse.json(cancelledOrder);
    } catch (error) {
        console.log("[ORDER_CANCEL]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
