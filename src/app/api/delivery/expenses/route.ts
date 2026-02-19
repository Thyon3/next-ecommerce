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
      date,
      attachments 
    } = body;

    if (!deliveryPersonId || !type || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create expense
    const expense = await db.deliveryExpense.create({
      data: {
        deliveryPersonId,
        type,
        amount: parseFloat(amount),
        reason: reason || '',
        date: date ? new Date(date) : new Date(),
        attachments: attachments || [],
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      expense,
      message: "Expense created successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_EXPENSE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const expenseId = searchParams.get('expenseId');
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (expenseId) {
      whereClause.id = expenseId;
    }

    if (deliveryPersonId) {
      whereClause.deliveryPersonId = deliveryPersonId;
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get expenses
    const [expenses, totalCount] = await Promise.all([
      db.deliveryExpense.findMany({
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
          date: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryExpense.count({ where: whereClause })
    ]);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_EXPENSE_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      expenseId, 
      type, 
      amount, 
      reason,
      status,
      attachments 
    } = body;

    if (!expenseId) {
      return new NextResponse("Expense ID is required", { status: 400 });
    }

    // Update expense
    const updateData: any = {
      updatedAt: new Date()
    };

    if (type !== undefined) updateData.type = type;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (reason !== undefined) updateData.reason = reason;
    if (status !== undefined) updateData.status = status;
    if (attachments !== undefined) updateData.attachments = attachments;

    const updatedExpense = await db.deliveryExpense.update({
      where: { id: expenseId },
      data: updateData
    });

    return NextResponse.json({
      expense: updatedExpense,
      message: "Expense updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_EXPENSE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const expenseId = searchParams.get('expenseId');

    if (!expenseId) {
      return new NextResponse("Expense ID is required", { status: 400 });
    }

    // Delete expense
    const deletedExpense = await db.deliveryExpense.delete({
      where: { id: expenseId }
    });

    return NextResponse.json({
      expense: deletedExpense,
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_EXPENSE_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
