import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== Role.ADMIN) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { csv } = body;

        if (!csv) {
            return new NextResponse("CSV data is required", { status: 400 });
        }

        const lines = csv.split("\n");
        const headers = lines[0].split(",");
        const productsRaw = lines.slice(1).filter((line: string) => line.trim() !== "");

        const results = [];
        for (const line of productsRaw) {
            const values = line.split(",");
            const productData: any = {};
            headers.forEach((header: string, index: number) => {
                productData[header.trim()] = values[index]?.trim();
            });

            // Basic validation
            if (!productData.name || !productData.price || !productData.categoryID || !productData.brandID) {
                results.push({ name: productData.name || "Unknown", status: "FAILED", error: "Missing required fields" });
                continue;
            }

            try {
                await db.product.create({
                    data: {
                        name: productData.name,
                        price: parseFloat(productData.price),
                        salePrice: productData.salePrice ? parseFloat(productData.salePrice) : null,
                        stock: parseInt(productData.stock || "0"),
                        desc: productData.desc || "",
                        categoryID: productData.categoryID,
                        brandID: productData.brandID,
                        images: productData.images ? productData.images.split(";") : [],
                        specialFeatures: productData.specialFeatures ? productData.specialFeatures.split(";") : [],
                        isAvailable: productData.isAvailable === "true" || productData.isAvailable === "1"
                    }
                });
                results.push({ name: productData.name, status: "SUCCESS" });
            } catch (error: any) {
                results.push({ name: productData.name, status: "FAILED", error: error.message });
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.log("[PRODUCTS_IMPORT_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
