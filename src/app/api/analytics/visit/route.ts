import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";
import { PageType } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { pageType, pagePath, productID, deviceResolution } = body;

        if (!pageType || !Object.values(PageType).includes(pageType)) {
            return new NextResponse("Invalid page type", { status: 400 });
        }

        const visit = await db.pageVisit.create({
            data: {
                pageType,
                pagePath,
                productID: productID || null,
                deviceResolution
            }
        });

        return NextResponse.json(visit);
    } catch (error) {
        console.log("[PAGE_VISIT_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
