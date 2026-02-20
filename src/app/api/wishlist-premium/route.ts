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
      price,
      expiresAt,
      autoRenew
    } = body;

    if (!userId || !productId || !quantity || !price) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if already in wishlist
    const existingItem = await db.wishlist.findFirst({
      where: {
        userId,
        productId,
        variantId: variantId || null
      }
    });

    if (existingItem) {
      return new NextResponse("Item already in wishlist", { status: 400 });
    }

    // Add to wishlist
    const wishlistItem = await db.wishlist.create({
      data: {
        userId,
        productId,
        variantId,
        quantity,
        price: parseFloat(price),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        autoRenew: autoRenew || false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      wishlistItem,
      message: "Item added to wishlist successfully"
    });

  } catch (error) {
    console.error("[WISHLIST_CREATE_ERROR]", error);
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

    // Get wishlist items
    const [wishlistItems, totalCount] = await Promise.all([
      db.wishlist.findMany({
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
      db.wishlist.count({ where: { userId } })
    ]);

    return NextResponse.json({
      wishlistItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[WISHLIST_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wishlistItemId = searchParams.get('wishlistItemId');

    if (!wishlistItemId) {
      return new NextResponse("Wishlist item ID is required", { status: 400 });
    }

    // Remove from wishlist
    const deletedItem = await db.wishlist.delete({
      where: { id: wishlistItemId }
    });

    return NextResponse.json({
      wishlistItem: deletedItem,
      message: "Item removed from wishlist successfully"
    });

  } catch (error) {
    console.error("[WISHLIST_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      wishlistItemId,
      quantity,
      autoRenew,
      expiresAt
    } = body;

    if (!wishlistItemId) {
      return new NextResponse("Wishlist item ID is required", { status: 400 });
    }

    // Update wishlist item
    const updateData: any = {
      updatedAt: new Date()
    };

    if (quantity !== undefined) updateData.quantity = quantity;
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);

    const updatedItem = await db.wishlist.update({
      where: { id: wishlistItemId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true
          }
        }
      }
    });

    return NextResponse.json({
      wishlistItem: updatedItem,
      message: "Wishlist item updated successfully"
    });

  } catch (error) {
    console.error("[WISHLIST_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
