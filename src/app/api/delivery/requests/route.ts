import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, 
      orderId, 
      deliveryAddress, 
      deliveryType, 
      scheduledTime, 
      instructions,
      contactPhone,
      contactName 
    } = body;

    if (!userId || !orderId || !deliveryAddress) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create delivery request
    const deliveryRequest = await db.deliveryRequest.create({
      data: {
        userId,
        orderId,
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postalCode: deliveryAddress.postalCode,
          country: deliveryAddress.country || 'US',
          coordinates: deliveryAddress.coordinates || null
        },
        deliveryType: deliveryType || 'STANDARD',
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        instructions: instructions || '',
        contactPhone: contactPhone || '',
        contactName: contactName || '',
        status: 'PENDING',
        priority: 'NORMAL',
        estimatedDeliveryTime: calculateEstimatedDeliveryTime(deliveryType, scheduledTime),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update order with delivery request
    await db.order.update({
      where: { id: orderId },
      data: {
        deliveryRequestId: deliveryRequest.id,
        status: 'AWAITING_DELIVERY'
      }
    });

    return NextResponse.json({
      deliveryRequest,
      message: "Delivery request created successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_REQUEST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (orderId) {
      whereClause.orderId = orderId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get delivery requests
    const [deliveryRequests, totalCount] = await Promise.all([
      db.deliveryRequest.findMany({
        where: whereClause,
        include: {
          order: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
              items: {
                select: {
                  product: {
                    select: {
                      name: true,
                      images: true
                    }
                  }
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          deliveryPerson: {
            select: {
              id: true,
              name: true,
              phone: true,
              vehicle: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryRequest.count({ where: whereClause })
    ]);

    return NextResponse.json({
      deliveryRequests,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_REQUEST_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryRequestId, 
      status, 
      instructions, 
      scheduledTime, 
      contactPhone,
      contactName 
    } = body;

    if (!deliveryRequestId) {
      return new NextResponse("Delivery request ID is required", { status: 400 });
    }

    // Update delivery request
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime ? new Date(scheduledTime) : null;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (contactName !== undefined) updateData.contactName = contactName;

    const updatedRequest = await db.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: updateData
    });

    // Update order status if delivery is completed
    if (status === 'DELIVERED') {
      await db.order.update({
        where: { id: updatedRequest.orderId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      });
    }

    return NextResponse.json({
      deliveryRequest: updatedRequest,
      message: "Delivery request updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_REQUEST_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

function calculateEstimatedDeliveryTime(deliveryType: string, scheduledTime?: string): Date {
  const now = new Date();
  
  if (scheduledTime) {
    return new Date(scheduledTime);
  }

  // Calculate based on delivery type
  switch (deliveryType) {
    case 'EXPRESS':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    case 'SAME_DAY':
      return new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
    case 'NEXT_DAY':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    case 'STANDARD':
    default:
      return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
  }
}
