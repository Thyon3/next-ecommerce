import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function DELETE(
    req: Request,
    { params }: { params: { productId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { productId } = params;

        if (!productId) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const userId = (session.user as any).id || (await db.user.findUnique({ where: { email: session.user?.email || "" } }))?.id;

        const wishlist = await db.wishlist.delete({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        return NextResponse.json(wishlist);
    } catch (error) {
        console.log("[WISHLIST_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
