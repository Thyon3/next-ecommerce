import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";
import { Role, ReturnStatus } from "@prisma/client";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== Role.ADMIN) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        if (!status || !Object.values(ReturnStatus).includes(status)) {
            return new NextResponse("Invalid status", { status: 400 });
        }

        const updatedReturn = await db.returnRequest.update({
            where: { id: params.id },
            data: { status }
        });

        // If refunded, maybe update order status too
        if (status === ReturnStatus.REFUNDED) {
            await db.order.update({
                where: { id: updatedReturn.orderId },
                data: { status: 'CANCELLED' } // Or a new status like REFUNDED if added
            });
        }

        return NextResponse.json(updatedReturn);
    } catch (error) {
        console.log("[ADMIN_RETURN_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
