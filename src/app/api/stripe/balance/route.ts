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
      amount, 
      currency = 'usd', 
      description,
      metadata 
    } = await req.json();

    if (!customerId || !amount) {
      return NextResponse.json(
        { error: 'Customer ID and amount are required' },
        { status: 400 }
      );
    }

    // Create balance transaction
    const balanceTransaction = await stripe.customers.createBalanceTransaction(
      customerId,
      {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description: description || 'Balance adjustment',
        metadata: metadata || {},
      }
    );

    return NextResponse.json({
      success: true,
      balanceTransaction,
      message: 'Balance transaction created successfully'
    });

  } catch (error: any) {
    console.error('Create balance transaction error:', error);
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
    const transactionId = searchParams.get('transaction_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (transactionId) {
      // Retrieve specific balance transaction
      const transaction = await stripe.customers.retrieveBalanceTransaction(
        transactionId
      );
      return NextResponse.json({ transaction });
    } else {
      // List balance transactions for customer
      if (!customerId) {
        return NextResponse.json(
          { error: 'Customer ID is required for listing transactions' },
          { status: 400 }
        );
      }

      const transactions = await stripe.customers.listBalanceTransactions(
        customerId,
        { limit }
      );

      return NextResponse.json({
        transactions: transactions.data,
        hasMore: transactions.has_more
      });
    }

  } catch (error: any) {
    console.error('Retrieve balance transaction error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { transactionId, metadata } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Update balance transaction metadata
    const transaction = await stripe.customers.updateBalanceTransaction(
      transactionId,
      { metadata: metadata || {} }
    );

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Balance transaction updated successfully'
    });

  } catch (error: any) {
    console.error('Update balance transaction error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
