import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with dummy key
const stripe = new Stripe('sk_test_dummy_key_123456789', {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { 
      customerId, 
      priceId, 
      trialPeriodDays,
      metadata,
      paymentMethodId 
    } = await req.json();

    if (!customerId || !priceId) {
      return NextResponse.json(
        { error: 'Customer ID and price ID are required' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: trialPeriodDays,
      metadata: metadata || {},
      default_payment_method: paymentMethodId,
    });

    // Handle subscription status
    if (subscription.status === 'incomplete') {
      const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent;
      
      return NextResponse.json({
        success: false,
        requiresAction: true,
        subscription,
        clientSecret: paymentIntent?.client_secret,
        message: 'Subscription requires payment confirmation'
      });
    } else if (subscription.status === 'active') {
      return NextResponse.json({
        success: true,
        subscription,
        message: 'Subscription created successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        subscription,
        message: 'Subscription created but requires attention'
      });
    }

  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('subscription_id');
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');

    let subscriptions;

    if (subscriptionId) {
      // Retrieve specific subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer']
      });
      return NextResponse.json({ subscription });
    } else {
      // List subscriptions
      const listParams: any = {
        limit: 10,
        expand: ['data.customer']
      };

      if (customerId) {
        listParams.customer = customerId;
      }

      if (status) {
        listParams.status = status;
      }

      subscriptions = await stripe.subscriptions.list(listParams);
      return NextResponse.json({
        subscriptions: subscriptions.data,
        hasMore: subscriptions.has_more
      });
    }

  } catch (error: any) {
    console.error('Retrieve subscription error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { subscriptionId, priceId, metadata, cancelAtPeriodEnd } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const updateParams: any = {
      expand: ['latest_invoice', 'customer']
    };

    if (priceId) {
      updateParams.items = [{ price: priceId }];
    }

    if (metadata) {
      updateParams.metadata = metadata;
    }

    if (cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = cancelAtPeriodEnd;
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, updateParams);

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription updated successfully'
    });

  } catch (error: any) {
    console.error('Update subscription error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('subscription_id');
    const immediate = searchParams.get('immediate') === 'true';

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    let subscription;
    
    if (immediate) {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: immediate ? 'Subscription cancelled immediately' : 'Subscription will cancel at period end'
    });

  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
