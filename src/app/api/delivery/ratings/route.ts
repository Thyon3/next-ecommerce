import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryRequestId, 
      rating, 
      feedback,
      issues,
      wouldRecommend,
      tipAmount,
      photos 
    } = body;

    if (!deliveryRequestId || !rating) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if delivery is completed
    const deliveryRequest = await db.deliveryRequest.findUnique({
      where: { id: deliveryRequestId }
    });

    if (!deliveryRequest || deliveryRequest.status !== 'DELIVERED') {
      return new NextResponse("Delivery must be completed to rate", { status: 400 });
    }

    // Check if already rated
    const existingRating = await db.deliveryRating.findFirst({
      where: { deliveryRequestId }
    });

    if (existingRating) {
      return new NextResponse("Delivery already rated", { status: 400 });
    }

    // Create delivery rating
    const deliveryRating = await db.deliveryRating.create({
      data: {
        deliveryRequestId,
        userId: deliveryRequest.userId,
        deliveryPersonId: deliveryRequest.deliveryPersonId,
        rating: parseFloat(rating),
        feedback: feedback || '',
        issues: issues || [],
        wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : null,
        tipAmount: tipAmount ? parseFloat(tipAmount) : 0,
        photos: photos || [],
        createdAt: new Date()
      }
    });

    // Update delivery person rating
    const allRatings = await db.deliveryRating.findMany({
      where: { deliveryPersonId: deliveryRequest.deliveryPersonId }
    });

    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    const totalTips = allRatings.reduce((sum, r) => sum + r.tipAmount, 0);

    await db.deliveryPerson.update({
      where: { id: deliveryRequest.deliveryPersonId },
      data: {
        rating: averageRating,
        totalTips: totalTips,
        totalRatings: allRatings.length,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      deliveryRating,
      message: "Delivery rated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_RATING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ratingId = searchParams.get('ratingId');
    const deliveryRequestId = searchParams.get('deliveryRequestId');
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const userId = searchParams.get('userId');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (ratingId) {
      whereClause.id = ratingId;
    }

    if (deliveryRequestId) {
      whereClause.deliveryRequestId = deliveryRequestId;
    }

    if (deliveryPersonId) {
      whereClause.deliveryPersonId = deliveryPersonId;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (minRating && maxRating) {
      whereClause.rating = {
        gte: parseFloat(minRating),
        lte: parseFloat(maxRating)
      };
    }

    // Get ratings
    const [ratings, totalCount] = await Promise.all([
      db.deliveryRating.findMany({
        where: whereClause,
        include: {
          deliveryRequest: {
            include: {
              order: {
                select: {
                  id: true,
                  totalAmount: true
                }
              }
            }
          },
          deliveryPerson: {
            select: {
              id: true,
              name: true,
              vehicle: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryRating.count({ where: whereClause })
    ]);

    return NextResponse.json({
      ratings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_RATING_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      ratingId, 
      rating, 
      feedback,
      wouldRecommend 
    } = body;

    if (!ratingId) {
      return new NextResponse("Rating ID is required", { status: 400 });
    }

    // Update rating
    const updateData: any = {};

    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (feedback !== undefined) updateData.feedback = feedback;
    if (wouldRecommend !== undefined) updateData.wouldRecommend = wouldRecommend;

    const updatedRating = await db.deliveryRating.update({
      where: { id: ratingId },
      data: updateData
    });

    // Recalculate delivery person rating
    if (rating !== undefined) {
      const allRatings = await db.deliveryRating.findMany({
        where: { deliveryPersonId: updatedRating.deliveryPersonId }
      });

      const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      await db.deliveryPerson.update({
        where: { id: updatedRating.deliveryPersonId },
        data: {
          rating: averageRating,
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      rating: updatedRating,
      message: "Rating updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_RATING_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ratingId = searchParams.get('ratingId');

    if (!ratingId) {
      return new NextResponse("Rating ID is required", { status: 400 });
    }

    // Delete rating
    const deletedRating = await db.deliveryRating.delete({
      where: { id: ratingId }
    });

    // Recalculate delivery person rating
    const allRatings = await db.deliveryRating.findMany({
      where: { deliveryPersonId: deletedRating.deliveryPersonId }
    });

    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 5.0;

    await db.deliveryPerson.update({
      where: { id: deletedRating.deliveryPersonId },
      data: {
        rating: averageRating,
        totalRatings: allRatings.length,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      rating: deletedRating,
      message: "Rating deleted successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_RATING_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
