import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/shared/lib/email";
import { generateTrackingNumber } from "@/shared/lib/shipping";

export async function POST(req: Request) {
  try {
    const { orderId, action } = await req.json();

    if (!orderId || !action) {
      return new NextResponse("Missing orderId or action", { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    let updatedOrder;
    let trackingNumber;

    switch (action) {
      case 'ship':
        trackingNumber = generateTrackingNumber();
        updatedOrder = await db.order.update({
          where: { id: orderId },
          data: {
            status: "SHIPPED",
            // You might want to add trackingNumber to the Order model in schema
          }
        });

        // Send shipping confirmation email
        if (order.user?.email) {
          try {
            await sendOrderShippedEmail(updatedOrder, order.user, trackingNumber);
          } catch (emailError) {
            console.error("Failed to send shipping email:", emailError);
          }
        }

        return NextResponse.json({ 
          success: true, 
          order: updatedOrder,
          trackingNumber 
        });

      case 'deliver':
        updatedOrder = await db.order.update({
          where: { id: orderId },
          data: {
            status: "DELIVERED"
          }
        });

        // Send delivery confirmation email
        if (order.user?.email) {
          try {
            await sendOrderDeliveredEmail(updatedOrder, order.user);
          } catch (emailError) {
            console.error("Failed to send delivery email:", emailError);
          }
        }

        return NextResponse.json({ 
          success: true, 
          order: updatedOrder 
        });

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error("[ORDER_STATUS_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
