import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with dummy key
const stripe = new Stripe('sk_test_dummy_key_123456789', {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { 
      accountId, 
      amount, 
      currency = 'usd', 
      description,
      metadata 
    } = await req.json();

    if (!accountId || !amount) {
      return NextResponse.json(
        { error: 'Account ID and amount are required' },
        { status: 400 }
      );
    }

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      destination: accountId,
      description: description || 'Transfer to connected account',
      metadata: metadata || {},
    });

    return NextResponse.json({
      success: true,
      transfer,
      message: 'Transfer created successfully'
    });

  } catch (error: any) {
    console.error('Create transfer error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transferId = searchParams.get('transfer_id');
    const destination = searchParams.get('destination');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (transferId) {
      // Retrieve specific transfer
      const transfer = await stripe.transfers.retrieve(transferId);
      return NextResponse.json({ transfer });
    } else {
      // List transfers
      const listParams: any = { limit };

      if (destination) {
        listParams.destination = destination;
      }

      const transfers = await stripe.transfers.list(listParams);

      return NextResponse.json({
        transfers: transfers.data,
        hasMore: transfers.has_more
      });
    }

  } catch (error: any) {
    console.error('Retrieve transfer error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { transferId, metadata } = await req.json();

    if (!transferId) {
      return NextResponse.json(
        { error: 'Transfer ID is required' },
        { status: 400 }
      );
    }

    // Update transfer metadata
    const transfer = await stripe.transfers.update(transferId, {
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      transfer,
      message: 'Transfer updated successfully'
    });

  } catch (error: any) {
    console.error('Update transfer error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transferId = searchParams.get('transfer_id');
    const reversalReason = searchParams.get('reason') || 'Requested by customer';

    if (!transferId) {
      return NextResponse.json(
        { error: 'Transfer ID is required' },
        { status: 400 }
      );
    }

    // Create reversal
    const reversal = await stripe.transfers.createReversal(transferId, {
      description: reversalReason,
    });

    return NextResponse.json({
      success: true,
      reversal,
      message: 'Transfer reversal created successfully'
    });

  } catch (error: any) {
    console.error('Create transfer reversal error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
