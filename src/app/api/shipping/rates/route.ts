import { NextResponse } from "next/server";
import { calculateShippingRates } from "@/shared/lib/shipping";

export async function POST(req: Request) {
  try {
    const { address, orderTotal } = await req.json();

    if (!address || !orderTotal) {
      return new NextResponse("Missing address or order total", { status: 400 });
    }

    // Validate address
    if (!address.street || !address.city || !address.postalCode || !address.country) {
      return new NextResponse("Invalid address", { status: 400 });
    }

    const rates = await calculateShippingRates(address, orderTotal);

    return NextResponse.json({ rates });
  } catch (error) {
    console.error("[SHIPPING_RATES_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
