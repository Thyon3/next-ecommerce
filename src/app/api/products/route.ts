import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function POST(req: Request) {
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
        } = body;

        if (!name || !categoryID || !price || !brandID) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const product = await db.product.create({
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
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCTS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryID = searchParams.get("categoryID") || undefined;
        const brandID = searchParams.get("brandID") || undefined;
        const isAvailable = searchParams.get("isAvailable") === "false" ? false : true;

        const products = await db.product.findMany({
            where: {
                categoryID,
                brandID,
                isAvailable,
            },
            include: {
                category: true,
                brand: true,
            },
            orderBy: {
                id: "desc",
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.log("[PRODUCTS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
