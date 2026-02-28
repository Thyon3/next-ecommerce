import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId,
      productId,
      variantId,
      quantity,
      price
    } = body;

    if (!userId || !productId || !quantity || !price) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if already in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        userId,
        productId,
        variantId: variantId || null
      }
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        cartItem: updatedItem,
        message: "Cart item updated successfully"
      });
    }

    // Add new item to cart
    const cartItem = await db.cartItem.create({
      data: {
        userId,
        productId,
        variantId,
        quantity,
        price: parseFloat(price),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      cartItem,
      message: "Item added to cart successfully"
    });

  } catch (error) {
    console.error("[CART_ADD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Get cart items
    const [cartItems, totalCount] = await Promise.all([
      db.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
              category: true
            }
          },
          variant: {
            select: {
              id: true,
              name: true,
              price: true,
              sku: true,
              stock: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.cartItem.count({ where: { userId } })
    ]);

    // Calculate totals
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    return NextResponse.json({
      cartItems,
      summary: {
        totalAmount,
        totalItems,
        itemCount: cartItems.length
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[CART_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      cartItemId,
      quantity
    } = body;

    if (!cartItemId || !quantity) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update cart item
    const updatedItem = await db.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      cartItem: updatedItem,
      message: "Cart item updated successfully"
    });

  } catch (error) {
    console.error("[CART_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) {
      return new NextResponse("Cart item ID is required", { status: 400 });
    }

    // Remove from cart
    const deletedItem = await db.cartItem.delete({
      where: { id: cartItemId }
    });

    return NextResponse.json({
      cartItem: deletedItem,
      message: "Item removed from cart successfully"
    });

  } catch (error) {
    console.error("[CART_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Clear all cart items for user
    const deletedItems = await db.cartItem.deleteMany({
      where: { userId }
    });

    return NextResponse.json({
      deletedCount: deletedItems.count,
      message: "Cart cleared successfully"
    });

  } catch (error) {
    console.error("[CART_CLEAR_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
