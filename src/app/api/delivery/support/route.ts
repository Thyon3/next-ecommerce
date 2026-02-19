import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryRequestId, 
      issueType, 
      description, 
      severity,
      photos,
      contactInfo 
    } = body;

    if (!deliveryRequestId || !issueType || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create support ticket
    const supportTicket = await db.deliverySupportTicket.create({
      data: {
        deliveryRequestId,
        issueType,
        description,
        severity: severity || 'MEDIUM',
        photos: photos || [],
        contactInfo: contactInfo || {},
        status: 'OPEN',
        priority: calculatePriority(issueType, severity),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update delivery request status if needed
    if (issueType === 'DAMAGED_PACKAGE' || issueType === 'LOST_PACKAGE') {
      await db.deliveryRequest.update({
        where: { id: deliveryRequestId },
        data: {
          status: 'ISSUE_REPORTED',
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      supportTicket,
      message: "Support ticket created successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_SUPPORT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId');
    const deliveryRequestId = searchParams.get('deliveryRequestId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const issueType = searchParams.get('issueType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (ticketId) {
      whereClause.id = ticketId;
    }

    if (deliveryRequestId) {
      whereClause.deliveryRequestId = deliveryRequestId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (severity) {
      whereClause.severity = severity;
    }

    if (issueType) {
      whereClause.issueType = issueType;
    }

    // Get support tickets
    const [tickets, totalCount] = await Promise.all([
      db.deliverySupportTicket.findMany({
        where: whereClause,
        include: {
          deliveryRequest: {
            include: {
              order: {
                select: {
                  id: true,
                  totalAmount: true
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
                  phone: true
                }
              }
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliverySupportTicket.count({ where: whereClause })
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_SUPPORT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      ticketId, 
      status, 
      resolution, 
      adminNotes,
      resolvedAt 
    } = body;

    if (!ticketId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update support ticket
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (resolution !== undefined) updateData.resolution = resolution;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (resolvedAt !== undefined) updateData.resolvedAt = new Date(resolvedAt);

    const updatedTicket = await db.deliverySupportTicket.update({
      where: { id: ticketId },
      data: updateData
    });

    return NextResponse.json({
      ticket: updatedTicket,
      message: "Support ticket updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_SUPPORT_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return new NextResponse("Ticket ID is required", { status: 400 });
    }

    // Delete support ticket
    const deletedTicket = await db.deliverySupportTicket.delete({
      where: { id: ticketId }
    });

    return NextResponse.json({
      ticket: deletedTicket,
      message: "Support ticket deleted successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_SUPPORT_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

function calculatePriority(issueType: string, severity: string): string {
  // Calculate priority based on issue type and severity
  const highPriorityIssues = ['LOST_PACKAGE', 'DAMAGED_PACKAGE', 'SAFETY_INCIDENT'];
  const criticalSeverities = ['CRITICAL', 'HIGH'];

  if (highPriorityIssues.includes(issueType) || criticalSeverities.includes(severity)) {
    return 'HIGH';
  } else if (severity === 'MEDIUM') {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
}
