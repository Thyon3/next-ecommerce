import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryRequestId, 
      rating, 
      feedback,
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

    // Send notification to delivery person
    await sendRatingNotification(deliveryRequest, deliveryRating);

    return NextResponse.json({
      deliveryRating,
      message: "Delivery rated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_RATING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

async function sendRatingNotification(deliveryRequest: any, rating: any) {
  try {
    // Create notification for delivery person
    await db.deliveryNotification.create({
      data: {
        deliveryRequestId: deliveryRequest.id,
        type: 'RATING_RECEIVED',
        message: `You received a ${rating.rating}-star rating for delivery #${deliveryRequest.id.slice(-8)}`,
        recipient: 'DRIVER',
        channels: ['EMAIL', 'PUSH'],
        status: 'PENDING',
        metadata: {
          rating: rating.rating,
          feedback: rating.feedback,
          tipAmount: rating.tipAmount
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`Rating notification sent for delivery ${deliveryRequest.id}`);

  } catch (error) {
    console.error("[RATING_NOTIFICATION_ERROR]", error);
  }
}
