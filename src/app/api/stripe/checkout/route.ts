import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with dummy key
const stripe = new Stripe('sk_test_dummy_key_123456789', {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { items, customerEmail, successUrl, cancelUrl, orderId } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
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

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.images || [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: orderId || '',
        customerEmail: customerEmail || ''
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL'],
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,
      customer_creation: 'always',
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    });

    return NextResponse.json({
      session,
      status: session.status,
      paymentStatus: session.payment_status,
      customer: session.customer,
      lineItems: session.line_items,
      totalAmount: session.amount_total ? session.amount_total / 100 : 0,
    });

  } catch (error: any) {
    console.error('Retrieve session error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Expire the checkout session
    const session = await stripe.checkout.sessions.expire(sessionId);

    return NextResponse.json({
      success: true,
      session,
      message: 'Checkout session expired'
    });

  } catch (error: any) {
    console.error('Expire session error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
