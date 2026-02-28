import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Get user's order history
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true
                }
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              }
            }
          },
          deliveryRequest: {
            select: {
              id: true,
              status: true,
              estimatedDeliveryTime: true,
              deliveryPerson: {
                select: {
                  id: true,
                  name: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.order.count({ where: { userId } })
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[ORDER_HISTORY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId,
      productId,
      variantId,
      quantity,
      price
    } = body;

    if (!userId || !productId || !quantity || !price) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create new order
    const order = await db.order.create({
      data: {
        userId,
        totalAmount: parseFloat(price) * quantity,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: {
            productId,
            variantId,
            quantity,
            price: parseFloat(price),
            total: parseFloat(price) * quantity
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      order,
      message: "Order created successfully"
    });

  } catch (error) {
    console.error("[ORDER_CREATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      orderId,
      status,
      paymentStatus,
      shippingAddress,
      billingAddress
    } = body;

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    // Update order
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
    if (billingAddress !== undefined) updateData.billingAddress = billingAddress;

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      order: updatedOrder,
      message: "Order updated successfully"
    });

  } catch (error) {
    console.error("[ORDER_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    // Cancel order
    const cancelledOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      order: cancelledOrder,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    console.error("[ORDER_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
