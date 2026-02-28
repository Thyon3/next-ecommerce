import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId,
      productId,
      variantId,
      quantity,
      price,
      expiresAt,
      autoRenew
    } = body;

    if (!userId || !productId || !quantity || !price) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        userId,
        productId,
        variantId,
        quantity,
        price: parseFloat(price),
        status: 'ACTIVE',
        autoRenew: autoRenew || false,
        nextBillingDate: new Date(expiresAt || Date.now() + 30*24*60*60*1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      subscription,
      message: "Subscription created successfully"
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_CREATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Build where clause
    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status;
    }

    // Get subscriptions
    const [subscriptions, totalCount] = await Promise.all([
      db.subscription.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              price: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.subscription.count({ where: whereClause })
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      subscriptionId,
      status,
      quantity,
      autoRenew,
      nextBillingDate
    } = body;

    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // Update subscription
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) updateData.status = status;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
    if (nextBillingDate !== undefined) updateData.nextBillingDate = new Date(nextBillingDate);

    const updatedSubscription = await db.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        }
      }
    });

    return NextResponse.json({
      subscription: updatedSubscription,
      message: "Subscription updated successfully"
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // Cancel subscription
    const cancelledSubscription = await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      subscription: cancelledSubscription,
      message: "Subscription cancelled successfully"
    });

  } catch (error) {
    console.error("[SUBSCRIPTION_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
