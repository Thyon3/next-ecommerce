import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with dummy key
const stripe = new Stripe('sk_test_dummy_key_123456789', {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { 
      name, 
      description, 
      amount, 
      currency = 'usd', 
      interval = 'month',
      intervalCount = 1,
      trialPeriodDays,
      metadata,
      active = true 
    } = await req.json();

    if (!name || !amount) {
      return NextResponse.json(
        { error: 'Name and amount are required' },
        { status: 400 }
      );
    }

    // Create product first
    const product = await stripe.products.create({
      name,
      description: description || '',
      metadata: metadata || {},
      active,
    });

    // Create price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency,
      recurring: {
        interval,
        interval_count: intervalCount,
      },
      trial_period_days: trialPeriodDays,
      metadata: metadata || {},
      active,
    });

    return NextResponse.json({
      success: true,
      product,
      price,
      message: 'Product and price created successfully'
    });

  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');
    const priceId = searchParams.get('price_id');
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (productId) {
      // Retrieve specific product
      const product = await stripe.products.retrieve(productId, {
        expand: ['default_price']
      });
      
      // Get all prices for this product
      const prices = await stripe.prices.list({
        product: productId,
        active: true
      });

      return NextResponse.json({
        product,
        prices: prices.data
      });
    } else if (priceId) {
      // Retrieve specific price
      const price = await stripe.prices.retrieve(priceId, {
        expand: ['product']
      });
      
      return NextResponse.json({ price });
    } else {
      // List products
      const listParams: any = {
        limit,
        expand: ['data.default_price']
      };

      if (active !== null) {
        listParams.active = active === 'true';
      }

      const products = await stripe.products.list(listParams);
      
      return NextResponse.json({
        products: products.data,
        hasMore: products.has_more
      });
    }

  } catch (error: any) {
    console.error('Retrieve product error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { productId, priceId, name, description, active, metadata } = await req.json();

    if (!productId && !priceId) {
      return NextResponse.json(
        { error: 'Product ID or Price ID is required' },
        { status: 400 }
      );
    }

    let result;

    if (productId) {
      // Update product
      const updateParams: any = {};
      
      if (name !== undefined) updateParams.name = name;
      if (description !== undefined) updateParams.description = description;
      if (active !== undefined) updateParams.active = active;
      if (metadata !== undefined) updateParams.metadata = metadata;

      result = await stripe.products.update(productId, updateParams);
    } else if (priceId) {
      // Update price
      const updateParams: any = {};
      
      if (active !== undefined) updateParams.active = active;
      if (metadata !== undefined) updateParams.metadata = metadata;

      result = await stripe.prices.update(priceId, updateParams);
    }

    return NextResponse.json({
      success: true,
      result,
      message: 'Updated successfully'
    });

  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');
    const priceId = searchParams.get('price_id');

    if (!productId && !priceId) {
      return NextResponse.json(
        { error: 'Product ID or Price ID is required' },
        { status: 400 }
      );
    }

    let result;

    if (productId) {
      // Archive product (Stripe doesn't allow deletion)
      result = await stripe.products.update(productId, { active: false });
    } else if (priceId) {
      // Archive price
      result = await stripe.prices.update(priceId, { active: false });
    }

    return NextResponse.json({
      success: true,
      result,
      message: 'Archived successfully'
    });

  } catch (error: any) {
    console.error('Archive product error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
