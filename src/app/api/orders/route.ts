import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { items, shippingAddress, totalAmount } = body;

        if (!items || items.length === 0 || !shippingAddress || !totalAmount) {
            return new NextResponse("Invalid order data", { status: 400 });
        }

        // Use a transaction to ensure atomic order creation
        const order = await db.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: (session.user as any).id || (await tx.user.findUnique({ where: { email: session.user?.email || "" } }))?.id,
                    totalAmount,
                    shippingAddress,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            return newOrder;
        });

        return NextResponse.json(order);
    } catch (error) {
        console.log("[ORDERS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id || (await db.user.findUnique({ where: { email: session.user?.email || "" } }))?.id;

        const orders = await db.order.findMany({
            where: {
                userId,
            },
            include: {
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
        console.log("[ORDERS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
