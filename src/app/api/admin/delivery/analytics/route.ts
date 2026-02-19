import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30';
    const deliveryPersonId = searchParams.get('deliveryPersonId');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate
      }
    };

    if (deliveryPersonId) {
      whereClause.deliveryPersonId = deliveryPersonId;
    }

    // Get comprehensive analytics
    const [
      totalDeliveries,
      completedDeliveries,
      failedDeliveries,
      totalRevenue,
      totalTips,
      averageRating,
      deliveryTimes,
      topDeliveryPersons,
      deliveryTypes,
      dailyStats,
      issueStats
    ] = await Promise.all([
      // Total deliveries
      db.deliveryAssignment.count({
        where: {
          createdAt: whereClause.createdAt
        }
      }),

      // Completed deliveries
      db.deliveryAssignment.count({
        where: {
          ...whereClause,
          status: 'COMPLETED'
        }
      }),

      // Failed deliveries
      db.deliveryAssignment.count({
        where: {
          ...whereClause,
          status: 'FAILED'
        }
      }),

      // Total revenue
      db.deliveryRequest.aggregate({
        where: {
          ...whereClause,
          status: 'DELIVERED'
        },
        _sum: {
          order: {
            totalAmount: true
          }
        }
      }),

      // Total tips
      db.deliveryRating.aggregate({
        where: {
          deliveryRequest: {
            createdAt: whereClause.createdAt
          }
        },
        _sum: {
          tipAmount: true
        }
      }),

      // Average rating
      db.deliveryRating.aggregate({
        where: {
          deliveryRequest: {
            createdAt: whereClause.createdAt
          }
        },
        _avg: {
          rating: true
        }
      }),

      // Delivery times
      db.$queryRaw`
        SELECT 
          DATE(a.createdAt) as date,
          AVG(EXTRACT(EPOCH FROM (a.actualTime - a.assignedAt))/60) as avgDeliveryTime
        FROM DeliveryAssignment a
        WHERE a.createdAt >= ${startDate}
          AND a.status = 'COMPLETED'
          AND a.actualTime IS NOT NULL
        GROUP BY DATE(a.createdAt)
        ORDER BY date DESC
        LIMIT 30
      ` as Array<{ date: string; avgDeliveryTime: number }>,

      // Top delivery persons
      db.deliveryPerson.findMany({
        where: {
          deliveryAssignments: {
            some: {
              createdAt: whereClause.createdAt,
              status: 'COMPLETED'
            }
          }
        },
        include: {
          _count: {
            select: {
              deliveryAssignments: {
                where: {
                  createdAt: whereClause.createdAt,
                  status: 'COMPLETED'
                }
              }
            }
          }
        },
        orderBy: {
          rating: 'desc'
        },
        take: 10
      }),

      // Delivery types
      db.deliveryRequest.groupBy({
        by: ['deliveryType'],
        where: whereClause,
        _count: {
          id: true
        }
      }),

      // Daily stats
      db.$queryRaw`
        SELECT 
          DATE(dr.createdAt) as date,
          COUNT(*) as totalDeliveries,
          SUM(CASE WHEN dr.status = 'DELIVERED' THEN 1 ELSE 0 END) as completedDeliveries,
          SUM(CASE WHEN dr.status = 'FAILED' THEN 1 ELSE 0 END) as failedDeliveries
        FROM DeliveryRequest dr
        WHERE dr.createdAt >= ${startDate}
        GROUP BY DATE(dr.createdAt)
        ORDER BY date DESC
        LIMIT 30
      ` as Array<{ date: string; totalDeliveries: number; completedDeliveries: number; failedDeliveries: number }>,

      // Issue stats
      db.deliverySupportTicket.groupBy({
        by: ['issueType'],
        where: {
          createdAt: whereClause.createdAt
        },
        _count: {
          id: true
        }
      })
    ]);

    // Calculate metrics
    const successRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;
    const failureRate = totalDeliveries > 0 ? (failedDeliveries / totalDeliveries) * 100 : 0;
    const avgDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, dt) => sum + dt.avgDeliveryTime, 0) / deliveryTimes.length 
      : 0;

    return NextResponse.json({
      overview: {
        totalDeliveries,
        completedDeliveries,
        failedDeliveries,
        successRate,
        failureRate,
        totalRevenue: totalRevenue._sum.order?.totalAmount || 0,
        totalTips: totalTips._sum.tipAmount || 0,
        averageRating: averageRating._avg.rating || 0,
        avgDeliveryTime,
        period,
        startDate,
        endDate
      },
      topDeliveryPersons: topDeliveryPersons.map(person => ({
        ...person,
        completedDeliveries: person._count.deliveryAssignments
      })),
      deliveryTypes: deliveryTypes.map(type => ({
        type: type.deliveryType,
        count: type._count.id
      })),
      dailyStats,
      deliveryTimes,
      issueStats: issueStats.map(issue => ({
        issueType: issue.issueType,
        count: issue._count.id
      }))
    });

  } catch (error) {
    console.error("[DELIVERY_ANALYTICS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
