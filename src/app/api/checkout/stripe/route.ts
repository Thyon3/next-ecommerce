import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/authOptions";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { items, shippingAddress, totalAmount } = await req.json();

    if (!items || items.length === 0 || !shippingAddress || !totalAmount) {
      return new NextResponse("Invalid payment data", { status: 400 });
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.productName || "Product",
          images: item.imgUrl ? [`${process.env.NEXT_PUBLIC_APP_URL}/images/images/productImages/${item.imgUrl}`] : undefined,
        },
        unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      metadata: {
        userId: (session.user as any).id,
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify(items),
      },
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
