import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryPersonId, 
      type, 
      amount, 
      reason,
      startDate,
      endDate,
      isRecurring,
      recurringFrequency 
    } = body;

    if (!deliveryPersonId || !type || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create commission rule
    const commissionRule = await db.commissionRule.create({
      data: {
        deliveryPersonId,
        type,
        amount: parseFloat(amount),
        reason: reason || '',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isRecurring: isRecurring || false,
        recurringFrequency: recurringFrequency || 'MONTHLY',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      commissionRule,
      message: "Commission rule created successfully"
    });

  } catch (error) {
    console.error("[COMMISSION_RULE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ruleId = searchParams.get('ruleId');
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (ruleId) {
      whereClause.id = ruleId;
    }

    if (deliveryPersonId) {
      whereClause.deliveryPersonId = deliveryPersonId;
    }

    if (type) {
      whereClause.type = type;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    // Get commission rules
    const [rules, totalCount] = await Promise.all([
      db.commissionRule.findMany({
        where: whereClause,
        include: {
          deliveryPerson: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.commissionRule.count({ where: whereClause })
    ]);

    return NextResponse.json({
      rules,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[COMMISSION_RULE_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      ruleId, 
      type, 
      amount, 
      reason,
      startDate,
      endDate,
      isActive 
    } = body;

    if (!ruleId) {
      return new NextResponse("Rule ID is required", { status: 400 });
    }

    // Update commission rule
    const updateData: any = {
      updatedAt: new Date()
    };

    if (type !== undefined) updateData.type = type;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (reason !== undefined) updateData.reason = reason;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedRule = await db.commissionRule.update({
      where: { id: ruleId },
      data: updateData
    });

    return NextResponse.json({
      commissionRule: updatedRule,
      message: "Commission rule updated successfully"
    });

  } catch (error) {
    console.error("[COMMISSION_RULE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return new NextResponse("Rule ID is required", { status: 400 });
    }

    // Delete commission rule
    const deletedRule = await db.commissionRule.delete({
      where: { id: ruleId }
    });

    return NextResponse.json({
      commissionRule: deletedRule,
      message: "Commission rule deleted successfully"
    });

  } catch (error) {
    console.error("[COMMISSION_RULE_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryPersonId, 
      periodStart, 
      periodEnd 
    } = body;

    if (!deliveryPersonId || !periodStart || !periodEnd) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Calculate commission for period
    const commissionData = await calculateCommissionForPeriod(
      deliveryPersonId,
      new Date(periodStart),
      new Date(periodEnd)
    );

    return NextResponse.json({
      commissionData,
      message: "Commission calculated successfully"
    });

  } catch (error) {
    console.error("[COMMISSION_CALCULATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

async function calculateCommissionForPeriod(
  deliveryPersonId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    // Get all commission rules for the delivery person
    const commissionRules = await db.commissionRule.findMany({
      where: {
        deliveryPersonId,
        isActive: true,
        OR: [
          {
            startDate: { lte: startDate },
            endDate: { gte: endDate }
          },
          {
            startDate: { lte: startDate },
            endDate: null
          }
        ]
      }
    });

    // Get completed deliveries for the period
    const completedDeliveries = await db.deliveryAssignment.findMany({
      where: {
        deliveryPersonId,
        status: 'COMPLETED',
        actualTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        deliveryRequest: {
          include: {
            order: {
              select: {
                totalAmount: true
              }
            }
          }
        }
      }
    });

    // Calculate commission for each delivery
    let totalCommission = 0;
    const commissionBreakdown = [];

    for (const delivery of completedDeliveries) {
      let deliveryCommission = 0;

      for (const rule of commissionRules) {
        if (rule.type === 'PERCENTAGE') {
          deliveryCommission += (delivery.deliveryRequest.order.totalAmount * rule.amount) / 100;
        } else if (rule.type === 'FIXED') {
          deliveryCommission += rule.amount;
        } else if (rule.type === 'PER_MILE') {
          // Would need distance calculation
          deliveryCommission += rule.amount * 5; // Placeholder
        } else if (rule.type === 'PER_DELIVERY') {
          deliveryCommission += rule.amount;
        }
      }

      totalCommission += deliveryCommission;
      commissionBreakdown.push({
        deliveryId: delivery.id,
        orderId: delivery.deliveryRequest.orderId,
        commission: deliveryCommission,
        rules: commissionRules.map(rule => ({
          type: rule.type,
          amount: rule.amount
        }))
      });
    }

    return {
      period: {
        startDate,
        endDate
      },
      summary: {
        totalDeliveries: completedDeliveries.length,
        totalRevenue: completedDeliveries.reduce((sum, d) => sum + d.deliveryRequest.order.totalAmount, 0),
        totalCommission,
        averageCommissionPerDelivery: completedDeliveries.length > 0 ? totalCommission / completedDeliveries.length : 0
      },
      breakdown: commissionBreakdown,
      appliedRules: commissionRules
    };

  } catch (error) {
    console.error("[COMMISSION_CALCULATION_DETAIL_ERROR]", error);
    throw error;
  }
}
