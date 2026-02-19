import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/authOptions";
import Stripe from "stripe";
import { db } from "@/shared/lib/db";
<<<<<<< HEAD
import { sendOrderConfirmationEmail } from "@/shared/lib/email";
import { generateTrackingNumber } from "@/shared/lib/shipping";
=======
>>>>>>> 7c1c2b9 (feat: integrate Stripe payment processing)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Get metadata from the session
      const userId = session.metadata?.userId;
      const shippingAddress = JSON.parse(session.metadata?.shippingAddress || "{}");
      const items = JSON.parse(session.metadata?.items || "[]");

      if (!userId || !items.length) {
        console.error("Missing metadata in webhook");
        return new NextResponse("Invalid metadata", { status: 400 });
      }

      // Create order in database
      const order = await db.$transaction(async (tx) => {
        // Check stock for each item
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product?.name || item.productId}`);
          }

          // Decrement stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });

          // Log stock change
          await tx.stockLog.create({
            data: {
              productId: item.productId,
              oldStock: product.stock,
              newStock: product.stock - item.quantity,
              reason: `ORDER_SALE:${item.productId}`
            }
          });
        }

        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

        const newOrder = await tx.order.create({
          data: {
            userId,
            totalAmount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
            shippingAddress,
            estimatedDelivery,
            status: "PROCESSING",
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        // Award loyalty points (e.g., 1 point per $10)
        const pointsEarned = Math.floor((session.amount_total || 0) / 1000);
        if (pointsEarned > 0) {
          await tx.user.update({
            where: { id: userId },
            data: {
              loyaltyPoints: {
                increment: pointsEarned
              }
            }
          });
        }

        return newOrder;
      });

      console.log("Order created successfully:", order.id);
<<<<<<< HEAD

      // Send order confirmation email
      try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (user) {
          const orderWithItems = await db.order.findUnique({
            where: { id: order.id },
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          });

          if (orderWithItems) {
            await sendOrderConfirmationEmail(orderWithItems, user);
          }
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }
=======
>>>>>>> 7c1c2b9 (feat: integrate Stripe payment processing)
    } catch (error) {
      console.error("Error creating order from webhook:", error);
      return new NextResponse("Order creation failed", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
