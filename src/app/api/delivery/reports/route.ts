import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryPersonId, 
      startTime, 
      endTime, 
      breakTime,
      totalDeliveries,
      totalEarnings,
      totalDistance,
      fuelCosts,
      notes 
    } = body;

    if (!deliveryPersonId || !startTime || !endTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create daily report
    const dailyReport = await db.deliveryDailyReport.create({
      data: {
        deliveryPersonId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        breakTime: breakTime ? new Date(breakTime) : null,
        totalDeliveries: totalDeliveries || 0,
        totalEarnings: totalEarnings ? parseFloat(totalEarnings) : 0,
        totalDistance: totalDistance ? parseFloat(totalDistance) : 0,
        fuelCosts: fuelCosts ? parseFloat(fuelCosts) : 0,
        netEarnings: (totalEarnings ? parseFloat(totalEarnings) : 0) - (fuelCosts ? parseFloat(fuelCosts) : 0),
        notes: notes || '',
        createdAt: new Date()
      }
    });

    // Update delivery person stats
    await db.deliveryPerson.update({
      where: { id: deliveryPersonId },
      data: {
        totalDeliveries: {
          increment: totalDeliveries || 0
        },
        totalEarnings: {
          increment: totalEarnings ? parseFloat(totalEarnings) : 0
        },
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      dailyReport,
      message: "Daily report created successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_DAILY_REPORT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (reportId) {
      whereClause.id = reportId;
    }

    if (deliveryPersonId) {
      whereClause.deliveryPersonId = deliveryPersonId;
    }

    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get daily reports
    const [reports, totalCount] = await Promise.all([
      db.deliveryDailyReport.findMany({
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
          startTime: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryDailyReport.count({ where: whereClause })
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_DAILY_REPORT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      reportId, 
      totalDeliveries, 
      totalEarnings, 
      totalDistance,
      fuelCosts,
      notes 
    } = body;

    if (!reportId) {
      return new NextResponse("Report ID is required", { status: 400 });
    }

    // Update daily report
    const updateData: any = {};

    if (totalDeliveries !== undefined) updateData.totalDeliveries = totalDeliveries;
    if (totalEarnings !== undefined) updateData.totalEarnings = parseFloat(totalEarnings);
    if (totalDistance !== undefined) updateData.totalDistance = parseFloat(totalDistance);
    if (fuelCosts !== undefined) updateData.fuelCosts = parseFloat(fuelCosts);
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate net earnings
    const existingReport = await db.deliveryDailyReport.findUnique({
      where: { id: reportId }
    });

    if (existingReport && (totalEarnings !== undefined || fuelCosts !== undefined)) {
      const earnings = totalEarnings !== undefined ? parseFloat(totalEarnings) : existingReport.totalEarnings;
      const fuel = fuelCosts !== undefined ? parseFloat(fuelCosts) : existingReport.fuelCosts;
      updateData.netEarnings = earnings - fuel;
    }

    const updatedReport = await db.deliveryDailyReport.update({
      where: { id: reportId },
      data: updateData
    });

    return NextResponse.json({
      report: updatedReport,
      message: "Daily report updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_DAILY_REPORT_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return new NextResponse("Report ID is required", { status: 400 });
    }

    // Delete daily report
    const deletedReport = await db.deliveryDailyReport.delete({
      where: { id: reportId }
    });

    return NextResponse.json({
      report: deletedReport,
      message: "Daily report deleted successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_DAILY_REPORT_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
