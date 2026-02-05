import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id || (await db.user.findUnique({ where: { email: session.user?.email || "" } }))?.id;

        const wishlist = await db.wishlist.findMany({
            where: {
                userId,
            },
            include: {
                product: true,
            },
        });

        return NextResponse.json(wishlist);
    } catch (error) {
        console.log("[WISHLIST_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const userId = (session.user as any).id || (await db.user.findUnique({ where: { email: session.user?.email || "" } }))?.id;

        const wishlist = await db.wishlist.create({
            data: {
                userId,
                productId,
            },
            include: {
                product: true,
            },
        });

        return NextResponse.json(wishlist);
    } catch (error) {
        console.log("[WISHLIST_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
