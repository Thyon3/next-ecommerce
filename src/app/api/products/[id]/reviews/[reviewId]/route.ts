import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string, reviewId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const reviewId = (params as any).reviewId;

        if (!reviewId) {
            return new NextResponse("Review ID is required", { status: 400 });
        }

        const review = await db.review.findUnique({
            where: {
                id: reviewId,
            },
        });

        if (!review) {
            return new NextResponse("Review not found", { status: 404 });
        }

        const userId = (session.user as any).id || (await db.user.findUnique({ where: { email: session.user?.email || "" } }))?.id;
        const isAdmin = (session.user as any).role === "ADMIN";

        if (review.userId !== userId && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await db.review.delete({
            where: {
                id: reviewId,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.log("[REVIEW_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
