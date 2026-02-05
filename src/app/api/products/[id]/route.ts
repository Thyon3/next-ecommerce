import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (!params.id) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const product = await db.product.findUnique({
            where: {
                id: params.id,
            },
            include: {
                category: true,
                brand: true,
                Review: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

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
        const {
            name,
            desc,
            specialFeatures,
            images,
            categoryID,
            optionSets,
            price,
            salePrice,
            specs,
            brandID,
            isAvailable
        } = body;

        if (!params.id) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const product = await db.product.update({
            where: {
                id: params.id,
            },
            data: {
                name,
                desc,
                specialFeatures,
                images,
                categoryID,
                optionSets,
                price,
                salePrice,
                specs,
                brandID,
                isAvailable
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any)?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.id) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const product = await db.product.delete({
            where: {
                id: params.id,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
