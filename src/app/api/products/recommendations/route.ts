import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";
import { PageType } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        let recommendedProducts = [];

        if (session && session.user) {
            const userId = (session.user as any).id || (await db.user.findUnique({ where: { email: session.user?.email || "" } }))?.id;

            // Find the most visited category for this user
            const mostVisitedCategory = await db.pageVisit.groupBy({
                by: ['productID'],
                where: {
                    pageType: PageType.PRODUCT,
                    productID: { not: null }
                },
                _count: {
                    _all: true
                },
                orderBy: {
                    _count: {
                        productID: 'desc'
                    }
                },
                take: 1
            });

            if (mostVisitedCategory.length > 0 && mostVisitedCategory[0].productID) {
                const baseProduct = await db.product.findUnique({
                    where: { id: mostVisitedCategory[0].productID },
                    select: { categoryID: true }
                });

                if (baseProduct) {
                    recommendedProducts = await db.product.findMany({
                        where: {
                            categoryID: baseProduct.categoryID,
                            id: { not: mostVisitedCategory[0].productID }
                        },
                        take: 4,
                        orderBy: {
                            stock: 'desc'
                        }
                    });
                }
            }
        }

        // Fallback: If no user history or no recommendations found, return best sellers
        if (recommendedProducts.length === 0) {
            recommendedProducts = await db.product.findMany({
                take: 4,
                orderBy: {
                    stock: 'asc' // Just illustrative placeholder for popularity
                }
            });
        }

        return NextResponse.json(recommendedProducts);
    } catch (error) {
        console.log("[RECOMMENDATIONS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
