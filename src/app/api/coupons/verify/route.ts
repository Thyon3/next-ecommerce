import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code } = body;

        if (!code) {
            return new NextResponse("Coupon code is required", { status: 400 });
        }

        const coupon = await db.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return new NextResponse("Invalid coupon code", { status: 404 });
        }

        if (!coupon.isActive) {
            return new NextResponse("Coupon is inactive", { status: 400 });
        }

        if (new Date() > new Date(coupon.expiryDate)) {
            return new NextResponse("Coupon has expired", { status: 400 });
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return new NextResponse("Coupon usage limit reached", { status: 400 });
        }

        return NextResponse.json({
            code: coupon.code,
            discount: coupon.discount,
            isFixed: coupon.isFixed
        });
    } catch (error) {
        console.log("[COUPON_VERIFY_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
