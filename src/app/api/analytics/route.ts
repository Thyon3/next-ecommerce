import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    const now = new Date();
    let dateFilter: any = {};

    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      };
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = {
        gte: weekAgo
      };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateFilter = {
        gte: monthAgo
      };
    } else if (period === 'year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      dateFilter = {
        gte: yearAgo
      };
    } else if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get orders in date range
    const orders = await db.order.findMany({
      where: {
        ...dateFilter,
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get products sold
    const productSales = new Map();
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const productId = item.productId;
        const currentSales = productSales.get(productId) || { quantity: 0, revenue: 0 };
        currentSales.quantity += item.quantity;
        currentSales.revenue += item.total;
        productSales.set(productId, currentSales);
      });
    });

    // Calculate analytics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products
    const topProducts = Array.from(productSales.entries())
      .map(([productId, sales]) => ({
        productId,
        quantity: sales.quantity,
        revenue: sales.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by category
    const categoryRevenue = new Map();
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.product?.category || 'unknown';
        const currentRevenue = categoryRevenue.get(category) || 0;
        categoryRevenue.set(category, currentRevenue + item.total);
      });
    });

    // Daily revenue
    const dailyRevenue = new Map();
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const currentRevenue = dailyRevenue.get(date) || 0;
      dailyRevenue.set(date, currentRevenue + order.totalAmount);
    });

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        period,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      },
      topProducts: topProducts.map(([productId, sales]) => ({
        productId,
        quantity: sales.quantity,
        revenue: sales.revenue
      })),
      categoryRevenue: Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
        category,
        revenue
      })),
      dailyRevenue: Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
        date,
        revenue
      })).sort((a, b) => a.date.localeCompare(b.date))
    });

  } catch (error) {
    console.error("[ANALYTICS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
