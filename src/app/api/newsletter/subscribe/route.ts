import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email || !email.includes('@')) {
            return new NextResponse("Valid email is required", { status: 400 });
        }

        const existing = await db.subscriber.findUnique({
            where: { email }
        });

        if (existing) {
            return new NextResponse("Already subscribed", { status: 400 });
        }

        await db.subscriber.create({
            data: { email }
        });

        return new NextResponse("Successfully subscribed", { status: 200 });
    } catch (error) {
        console.log("[NEWSLETTER_SUBSCRIBE_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
