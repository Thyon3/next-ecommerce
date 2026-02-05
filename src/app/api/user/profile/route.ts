import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/shared/lib/db";
import { authOptions } from "@/shared/lib/authOptions";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await db.user.findUnique({
            where: {
                email: session.user.email || "",
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                address: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.log("[USER_PROFILE_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, image, address } = body;

        const user = await db.user.update({
            where: {
                email: session.user.email || "",
            },
            data: {
                name,
                image,
                address,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.log("[USER_PROFILE_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
