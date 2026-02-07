import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== Role.ADMIN) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const products = await db.product.findMany({
            include: {
                brand: true,
                category: true
            }
        });

        // Generate CSV content
        const headers = ["ID", "Name", "Price", "SalePrice", "Stock", "Category", "Brand", "Available"];
        const rows = products.map(p => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            p.price,
            p.salePrice || "",
            p.stock,
            p.category.name,
            p.brand.name,
            p.isAvailable
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=products_export_${new Date().toISOString().split('T')[0]}.csv`
            }
        });
    } catch (error) {
        console.log("[PRODUCTS_EXPORT_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
