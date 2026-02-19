import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with dummy key
const stripe = new Stripe('sk_test_dummy_key_123456789', {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { 
      refundId, 
      amount, 
      reason, 
      metadata 
    } = await req.json();

    if (!refundId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Create refund
    const refundParams: any = {
      payment_intent: refundId,
      metadata: metadata || {},
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    return NextResponse.json({
      success: true,
      refund,
      message: 'Refund processed successfully'
    });

  } catch (error: any) {
    console.error('Create refund error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const refundId = searchParams.get('refund_id');
    const paymentIntentId = searchParams.get('payment_intent_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (refundId) {
      // Retrieve specific refund
      const refund = await stripe.refunds.retrieve(refundId);
      return NextResponse.json({ refund });
    } else {
      // List refunds
      const listParams: any = {
        limit,
        expand: ['data.payment_intent']
      };

      if (paymentIntentId) {
        listParams.payment_intent = paymentIntentId;
      }

      const refunds = await stripe.refunds.list(listParams);
      
      return NextResponse.json({
        refunds: refunds.data,
        hasMore: refunds.has_more
      });
    }

  } catch (error: any) {
    console.error('Retrieve refund error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { refundId, metadata } = await req.json();

    if (!refundId) {
      return NextResponse.json(
        { error: 'Refund ID is required' },
        { status: 400 }
      );
    }

    // Update refund metadata
    const refund = await stripe.refunds.update(refundId, {
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      refund,
      message: 'Refund updated successfully'
    });

  } catch (error: any) {
    console.error('Update refund error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
