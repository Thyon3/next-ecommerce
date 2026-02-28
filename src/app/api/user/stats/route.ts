import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // Calculate statistics
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return NextResponse.json({
      orders,
      statistics: {
        totalSpent,
        totalOrders,
        averageOrderValue
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[USER_STATS_ERROR]", error);
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
