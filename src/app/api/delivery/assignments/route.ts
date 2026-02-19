import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryRequestId, 
      deliveryPersonId, 
      estimatedTime,
      notes 
    } = body;

    if (!deliveryRequestId || !deliveryPersonId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if delivery person is available
    const deliveryPerson = await db.deliveryPerson.findUnique({
      where: { id: deliveryPersonId }
    });

    if (!deliveryPerson || !deliveryPerson.isAvailable) {
      return new NextResponse("Delivery person not available", { status: 400 });
    }

    // Check if delivery request is pending
    const deliveryRequest = await db.deliveryRequest.findUnique({
      where: { id: deliveryRequestId }
    });

    if (!deliveryRequest || deliveryRequest.status !== 'PENDING') {
      return new NextResponse("Delivery request not available", { status: 400 });
    }

    // Assign delivery person
    const assignment = await db.deliveryAssignment.create({
      data: {
        deliveryRequestId,
        deliveryPersonId,
        status: 'ASSIGNED',
        estimatedTime: estimatedTime ? new Date(estimatedTime) : new Date(),
        notes: notes || '',
        assignedAt: new Date(),
        acceptedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update delivery request
    await db.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: {
        status: 'ASSIGNED',
        deliveryPersonId,
        updatedAt: new Date()
      }
    });

    // Update delivery person current load
    const currentAssignments = await db.deliveryAssignment.count({
      where: {
        deliveryPersonId,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS']
        }
      }
    });

    await db.deliveryPerson.update({
      where: { id: deliveryPersonId },
      data: {
        currentLoad: currentAssignments,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      assignment,
      message: "Delivery assigned successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_ASSIGNMENT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const deliveryRequestId = searchParams.get('deliveryRequestId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (assignmentId) {
      whereClause.id = assignmentId;
    }

    if (deliveryPersonId) {
      whereClause.deliveryPersonId = deliveryPersonId;
    }

    if (deliveryRequestId) {
      whereClause.deliveryRequestId = deliveryRequestId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get assignments
    const [assignments, totalCount] = await Promise.all([
      db.deliveryAssignment.findMany({
        where: whereClause,
        include: {
          deliveryRequest: {
            include: {
              order: {
                select: {
                  id: true,
                  totalAmount: true,
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
              }
            }
          },
          deliveryPerson: {
            select: {
              id: true,
              name: true,
              phone: true,
              vehicle: true,
              rating: true
            }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryAssignment.count({ where: whereClause })
    ]);

    return NextResponse.json({
      assignments,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_ASSIGNMENT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      assignmentId, 
      status, 
      notes, 
      actualTime,
      deliveryPhoto,
      signature,
      location 
    } = body;

    if (!assignmentId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update assignment
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (notes !== undefined) updateData.notes = notes;
    if (actualTime !== undefined) updateData.actualTime = new Date(actualTime);
    if (deliveryPhoto !== undefined) updateData.deliveryPhoto = deliveryPhoto;
    if (signature !== undefined) updateData.signature = signature;
    if (location !== undefined) updateData.location = location;

    const updatedAssignment = await db.deliveryAssignment.update({
      where: { id: assignmentId },
      data: updateData
    });

    // Update delivery request status
    await db.deliveryRequest.update({
      where: { id: updatedAssignment.deliveryRequestId },
      data: {
        status: status === 'COMPLETED' ? 'DELIVERED' : status,
        updatedAt: new Date()
      }
    });

    // Update order status if delivered
    if (status === 'COMPLETED') {
      const deliveryRequest = await db.deliveryRequest.findUnique({
        where: { id: updatedAssignment.deliveryRequestId }
      });

      if (deliveryRequest) {
        await db.order.update({
          where: { id: deliveryRequest.orderId },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date()
          }
        });
      }

      // Update delivery person stats
      await db.deliveryPerson.update({
        where: { id: updatedAssignment.deliveryPersonId },
        data: {
          totalDeliveries: {
            increment: 1
          },
          onTimeDeliveries: {
            increment: actualTime && new Date(actualTime) <= updatedAssignment.estimatedTime ? 1 : 0
          },
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      assignment: updatedAssignment,
      message: "Assignment updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_ASSIGNMENT_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return new NextResponse("Assignment ID is required", { status: 400 });
    }

    // Cancel assignment
    const cancelledAssignment = await db.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update delivery request back to pending
    await db.deliveryRequest.update({
      where: { id: cancelledAssignment.deliveryRequestId },
      data: {
        status: 'PENDING',
        deliveryPersonId: null,
        updatedAt: new Date()
      }
    });

    // Update delivery person load
    const currentAssignments = await db.deliveryAssignment.count({
      where: {
        deliveryPersonId: cancelledAssignment.deliveryPersonId,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS']
        }
      }
    });

    await db.deliveryPerson.update({
      where: { id: cancelledAssignment.deliveryPersonId },
      data: {
        currentLoad: currentAssignments,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      assignment: cancelledAssignment,
      message: "Assignment cancelled successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_ASSIGNMENT_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
