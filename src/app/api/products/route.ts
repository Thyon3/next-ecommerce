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

        // New parameters
        const q = searchParams.get("q") || undefined;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const sort = searchParams.get("sort") || "newest"; // newest, price_asc, price_desc

        const skip = (page - 1) * limit;

        let orderBy: any = { id: "desc" };
        if (sort === "price_asc") orderBy = { price: "asc" };
        if (sort === "price_desc") orderBy = { price: "desc" };

        const products = await db.product.findMany({
            where: {
                categoryID,
                brandID,
                isAvailable,
                OR: q ? [
                    { name: { contains: q, mode: 'insensitive' } },
                    { desc: { contains: q, mode: 'insensitive' } },
                ] : undefined,
            },
            include: {
                category: true,
                brand: true,
            },
            orderBy,
            skip,
            take: limit,
        });

        const total = await db.product.count({
            where: {
                categoryID,
                brandID,
                isAvailable,
                OR: q ? [
                    { name: { contains: q, mode: 'insensitive' } },
                    { desc: { contains: q, mode: 'insensitive' } },
                ] : undefined,
            },
        });

        return NextResponse.json({
            products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.log("[PRODUCTS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
