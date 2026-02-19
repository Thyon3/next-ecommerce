import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with dummy key
const stripe = new Stripe('sk_test_dummy_key_123456789', {
  apiVersion: '2024-06-20',
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Get account balance
    const balance = await stripe.balance.retrieve();

    // Get payment metrics
    const [
      totalRevenue,
      successfulPayments,
      failedPayments,
      refundAmount,
      chargeVolume,
      recentTransactions
    ] = await Promise.all([
      // Total revenue (successful charges)
      stripe.charges.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        status: 'succeeded',
        limit: 100
      }).then(charges => 
        charges.data.reduce((sum, charge) => sum + charge.amount, 0)
      ),

      // Successful payments count
      stripe.charges.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        status: 'succeeded',
        limit: 1
      }).then(charges => charges.total_count),

      // Failed payments count
      stripe.charges.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        status: 'failed',
        limit: 1
      }).then(charges => charges.total_count),

      // Total refunds
      stripe.refunds.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 100
      }).then(refunds => 
        refunds.data.reduce((sum, refund) => sum + refund.amount, 0)
      ),

      // Charge volume
      stripe.charges.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 1
      }).then(charges => charges.total_count),

      // Recent transactions
      stripe.charges.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 10,
        expand: ['data.customer']
      })
    ]);

    // Calculate success rate
    const totalPayments = successfulPayments + failedPayments;
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    // Get daily revenue data
    const dailyRevenue = await stripe.charges.list({
      created: { gte: Math.floor(startDate.getTime() / 1000) },
      status: 'succeeded',
      limit: 100
    }).then(charges => {
      const revenueByDay: Record<string, number> = {};
      
      charges.data.forEach(charge => {
        const date = new Date(charge.created * 1000).toISOString().split('T')[0];
        revenueByDay[date] = (revenueByDay[date] || 0) + charge.amount;
      });

      return Object.entries(revenueByDay).map(([date, amount]) => ({
        date,
        revenue: amount / 100, // Convert to dollars
        count: charges.data.filter(c => 
          new Date(c.created * 1000).toISOString().split('T')[0] === date
        ).length
      }));
    });

    // Get payment method breakdown
    const paymentMethods = await stripe.charges.list({
      created: { gte: Math.floor(startDate.getTime() / 1000) },
      status: 'succeeded',
      limit: 100
    }).then(charges => {
      const methods: Record<string, number> = {};
      
      charges.data.forEach(charge => {
        const method = charge.payment_method_details?.type || 'unknown';
        methods[method] = (methods[method] || 0) + 1;
      });

      return Object.entries(methods).map(([method, count]) => ({
        method,
        count,
        percentage: (count / charges.data.length) * 100
      }));
    });

    // Get top customers
    const topCustomers = await stripe.charges.list({
      created: { gte: Math.floor(startDate.getTime() / 1000) },
      status: 'succeeded',
      limit: 100,
      expand: ['data.customer']
    }).then(charges => {
      const customers: Record<string, { name: string; email: string; total: number; count: number }> = {};
      
      charges.data.forEach(charge => {
        const customer = charge.customer as any;
        if (customer) {
          const customerId = customer.id;
          if (!customers[customerId]) {
            customers[customerId] = {
              name: customer.name || 'Unknown',
              email: customer.email || 'unknown@example.com',
              total: 0,
              count: 0
            };
          }
          customers[customerId].total += charge.amount;
          customers[customerId].count += 1;
        }
      });

      return Object.entries(customers)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    });

    return NextResponse.json({
      balance: {
        available: balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100,
        pending: balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100,
        currencies: balance.available.map(bal => bal.currency)
      },
      metrics: {
        totalRevenue: totalRevenue / 100,
        successfulPayments,
        failedPayments,
        successRate,
        refundAmount: refundAmount / 100,
        chargeVolume,
        netRevenue: (totalRevenue - refundAmount) / 100
      },
      dailyRevenue,
      paymentMethods,
      topCustomers,
      recentTransactions: recentTransactions.data.map(charge => ({
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency,
        status: charge.status,
        created: charge.created,
        customer: (charge.customer as any)?.email || 'Guest',
        description: charge.description,
        paymentMethod: charge.payment_method_details?.type || 'unknown'
      })),
      period,
      startDate,
      endDate
    });

  } catch (error: any) {
    console.error("[STRIPE_ANALYTICS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
