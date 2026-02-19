import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with dummy key
const stripe = new Stripe('sk_test_dummy_key_123456789', {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { paymentMethodId, type, cardDetails, billingDetails } = await req.json();

    if (!paymentMethodId && !cardDetails) {
      return NextResponse.json(
        { error: 'Payment method ID or card details are required' },
        { status: 400 }
      );
    }

    let paymentMethod;

    if (paymentMethodId) {
      // Retrieve existing payment method
      paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    } else if (cardDetails) {
      // Create new payment method
      paymentMethod = await stripe.paymentMethods.create({
        type: type || 'card',
        card: cardDetails,
        billing_details: billingDetails || {},
      });
    }

    return NextResponse.json({
      success: true,
      paymentMethod,
    });

  } catch (error: any) {
    console.error('Payment method error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const type = searchParams.get('type') || 'card';

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: type as Stripe.PaymentMethod.Type,
    });

    return NextResponse.json({
      paymentMethods: paymentMethods.data,
      hasMore: paymentMethods.has_more,
    });

  } catch (error: any) {
    console.error('List payment methods error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { paymentMethodId, cardDetails, billingDetails } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Update payment method (limited fields can be updated)
    const paymentMethod = await stripe.paymentMethods.update(paymentMethodId, {
      card: cardDetails,
      billing_details: billingDetails,
    });

    return NextResponse.json({
      success: true,
      paymentMethod,
    });

  } catch (error: any) {
    console.error('Update payment method error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentMethodId = searchParams.get('payment_method_id');

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Detach payment method from customer
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({
      success: true,
      paymentMethod,
      message: 'Payment method detached successfully'
    });

  } catch (error: any) {
    console.error('Detach payment method error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
