import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { rating, comment } = body;

        if (!params.id) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        if (!rating || !comment) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const userId = (session.user as any).id || (await db.user.findUnique({ where: { email: session.user?.email || "" } }))?.id;

        // Check if user already reviewed this product
        const existingReview = await db.review.findFirst({
            where: {
                userId,
                productId: params.id,
            },
        });

        if (existingReview) {
            return new NextResponse("You have already reviewed this product", { status: 400 });
        }

        const review = await db.review.create({
            data: {
                rating,
                comment,
                userId,
                productId: params.id,
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        console.log("[PRODUCT_REVIEWS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (!params.id) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const reviews = await db.review.findMany({
            where: {
                productId: params.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.log("[PRODUCT_REVIEWS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
