import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryPersonId, 
      latitude, 
      longitude, 
      accuracy,
      speed,
      heading,
      timestamp 
    } = body;

    if (!deliveryPersonId || !latitude || !longitude) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update delivery person location
    const locationUpdate = await db.deliveryLocation.create({
      data: {
        deliveryPersonId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        speed: speed ? parseFloat(speed) : null,
        heading: heading ? parseFloat(heading) : null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        createdAt: new Date()
      }
    });

    // Update delivery person current location
    await db.deliveryPerson.update({
      where: { id: deliveryPersonId },
      data: {
        currentLocation: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: accuracy ? parseFloat(accuracy) : null,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        },
        lastLocationUpdate: new Date(),
        updatedAt: new Date()
      }
    });

    // Check for nearby delivery requests
    const nearbyRequests = await findNearbyDeliveryRequests(
      parseFloat(latitude),
      parseFloat(longitude),
      deliveryPersonId
    );

    return NextResponse.json({
      locationUpdate,
      nearbyRequests,
      message: "Location updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_LOCATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!deliveryPersonId) {
      return new NextResponse("Delivery person ID is required", { status: 400 });
    }

    // Build where clause
    const whereClause: any = {
      deliveryPersonId
    };

    if (startTime && endTime) {
      whereClause.timestamp = {
        gte: new Date(startTime),
        lte: new Date(endTime)
      };
    }

    // Get location history
    const locationHistory = await db.deliveryLocation.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    // Get current location
    const deliveryPerson = await db.deliveryPerson.findUnique({
      where: { id: deliveryPersonId },
      select: {
        currentLocation: true,
        lastLocationUpdate: true
      }
    });

    return NextResponse.json({
      locationHistory,
      currentLocation: deliveryPerson?.currentLocation,
      lastLocationUpdate: deliveryPerson?.lastLocationUpdate
    });

  } catch (error) {
    console.error("[DELIVERY_LOCATION_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryPersonId, 
      latitude, 
      longitude, 
      accuracy,
      timestamp 
    } = body;

    if (!deliveryPersonId) {
      return new NextResponse("Delivery person ID is required", { status: 400 });
    }

    // Update current location directly
    const updatedDeliveryPerson = await db.deliveryPerson.update({
      where: { id: deliveryPersonId },
      data: {
        currentLocation: {
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          accuracy: accuracy ? parseFloat(accuracy) : undefined,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        },
        lastLocationUpdate: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      deliveryPerson: updatedDeliveryPerson,
      message: "Current location updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_LOCATION_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

async function findNearbyDeliveryRequests(
  latitude: number, 
  longitude: number, 
  deliveryPersonId: string
) {
  try {
    // Find delivery requests within 5 miles
    const nearbyRequests = await db.deliveryRequest.findMany({
      where: {
        status: 'PENDING',
        deliveryAddress: {
          // This would need to be implemented with proper geospatial queries
          // For now, we'll return all pending requests
        }
      },
      include: {
        order: {
          select: {
            id: true,
            totalAmount: true,
            items: {
              select: {
                product: {
                  select: {
                    name: true,
                    images: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate distance for each request (simplified)
    const requestsWithDistance = nearbyRequests.map(request => {
      const distance = calculateDistance(
        latitude, longitude,
        request.deliveryAddress.coordinates?.lat || 0,
        request.deliveryAddress.coordinates?.lng || 0
      );
      
      return {
        ...request,
        distance,
        estimatedTime: new Date(Date.now() + distance * 10 * 60 * 1000) // 10 minutes per mile
      };
    });

    return requestsWithDistance;

  } catch (error) {
    console.error("[NEARBY_REQUESTS_ERROR]", error);
    return [];
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
