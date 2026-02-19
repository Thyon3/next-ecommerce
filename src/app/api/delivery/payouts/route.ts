import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryPersonId, 
      earnings, 
      deductions, 
      bonus,
      periodStart, 
      periodEnd,
      notes 
    } = body;

    if (!deliveryPersonId || !earnings || !periodStart || !periodEnd) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Calculate total payout
    const totalEarnings = parseFloat(earnings);
    const totalDeductions = deductions ? parseFloat(deductions) : 0;
    const totalBonus = bonus ? parseFloat(bonus) : 0;
    const totalPayout = totalEarnings - totalDeductions + totalBonus;

    // Create payout record
    const payout = await db.deliveryPayout.create({
      data: {
        deliveryPersonId,
        earnings: totalEarnings,
        deductions: totalDeductions,
        bonus: totalBonus,
        totalPayout,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'PENDING',
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      payout,
      message: "Payout created successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_PAYOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payoutId = searchParams.get('payoutId');
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const status = searchParams.get('status');
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (payoutId) {
      whereClause.id = payoutId;
    }

    if (deliveryPersonId) {
      whereClause.deliveryPersonId = deliveryPersonId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (periodStart && periodEnd) {
      whereClause.periodStart = {
        gte: new Date(periodStart)
      };
      whereClause.periodEnd = {
        lte: new Date(periodEnd)
      };
    }

    // Get payouts
    const [payouts, totalCount] = await Promise.all([
      db.deliveryPayout.findMany({
        where: whereClause,
        include: {
          deliveryPerson: {
            select: {
              id: true,
              name: true,
              email: true,
              bankAccount: true
            }
          }
        },
        orderBy: {
          periodStart: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryPayout.count({ where: whereClause })
    ]);

    return NextResponse.json({
      payouts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_PAYOUT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      payoutId, 
      status, 
      paidAt, 
      transactionId,
      notes 
    } = body;

    if (!payoutId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update payout
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (paidAt !== undefined) updateData.paidAt = new Date(paidAt);
    if (transactionId !== undefined) updateData.transactionId = transactionId;
    if (notes !== undefined) updateData.notes = notes;

    const updatedPayout = await db.deliveryPayout.update({
      where: { id: payoutId },
      data: updateData
    });

    return NextResponse.json({
      payout: updatedPayout,
      message: "Payout updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_PAYOUT_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payoutId = searchParams.get('payoutId');

    if (!payoutId) {
      return new NextResponse("Payout ID is required", { status: 400 });
    }

    // Delete payout
    const deletedPayout = await db.deliveryPayout.delete({
      where: { id: payoutId }
    });

    return NextResponse.json({
      payout: deletedPayout,
      message: "Payout deleted successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_PAYOUT_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
