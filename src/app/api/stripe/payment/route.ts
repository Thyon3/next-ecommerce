import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with dummy key
const stripe = new Stripe('sk_test_dummy_key_123456789', {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { amount, currency = 'usd', paymentMethodId, orderId, customerEmail } = await req.json();

    if (!amount || !paymentMethodId) {
      return new NextResponse(
        JSON.stringify({ error: 'Amount and payment method are required' }),
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customerId;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { orderId }
        });
        customerId = customer.id;
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method: paymentMethodId,
      customer: customerId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: { orderId },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/return`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    // Handle payment intent status
    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        paymentIntent,
        message: 'Payment successful'
      });
    } else if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        success: false,
        requiresAction: true,
        paymentIntent,
        message: 'Payment requires additional authentication'
      });
    } else if (paymentIntent.status === 'requires_payment_method') {
      return NextResponse.json({
        success: false,
        requiresPaymentMethod: true,
        paymentIntent,
        message: 'Payment method is required'
      });
    } else {
      return NextResponse.json({
        success: false,
        paymentIntent,
        message: 'Payment processing'
      });
    }

  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      paymentIntent,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency
    });

  } catch (error: any) {
    console.error('Retrieve payment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { paymentIntentId, paymentMethodId } = await req.json();

    if (!paymentIntentId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment intent ID and payment method are required' },
        { status: 400 }
      );
    }

    // Confirm payment with new payment method
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId
    });

    return NextResponse.json({
      success: paymentIntent.status === 'succeeded',
      paymentIntent,
      message: paymentIntent.status === 'succeeded' ? 'Payment confirmed' : 'Payment requires action'
    });

  } catch (error: any) {
    console.error('Confirm payment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
