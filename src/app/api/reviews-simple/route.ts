import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId,
      productId,
      rating,
      content,
      type,
      helpful
    } = body;

    if (!userId || !productId || !rating || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create review
    const review = await db.review.create({
      data: {
        userId,
        productId,
        rating: parseInt(rating),
        content,
        type: type || 'PRODUCT',
        status: 'PENDING',
        verified: false,
        helpful: helpful || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update product rating
    const allReviews = await db.review.findMany({
      where: { productId, status: 'APPROVED' }
    });

    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;

    await db.product.update({
      where: { id: productId },
      data: {
        averageRating: averageRating,
        reviewCount: allReviews.length,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      review,
      message: "Review submitted successfully"
    });

  } catch (error) {
    console.error("[REVIEW_CREATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (productId) {
      whereClause.productId = productId;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get reviews
    const [reviews, totalCount] = await Promise.all([
      db.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.review.count({ where: whereClause })
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[REVIEW_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      reviewId,
      status,
      verified,
      helpful
    } = body;

    if (!reviewId) {
      return new NextResponse("Review ID is required", { status: 400 });
    }

    // Update review
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) updateData.status = status;
    if (verified !== undefined) updateData.verified = verified;
    if (helpful !== undefined) updateData.helpful = helpful;

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      review: updatedReview,
      message: "Review updated successfully"
    });

  } catch (error) {
    console.error("[REVIEW_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return new NextResponse("Review ID is required", { status: 400 });
    }

    // Delete review
    const deletedReview = await db.review.delete({
      where: { id: reviewId }
    });

    return NextResponse.json({
      review: deletedReview,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("[REVIEW_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
