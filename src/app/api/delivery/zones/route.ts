import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      description, 
      basePrice, 
      pricePerMile, 
      pricePerMinute,
      maxDistance,
      maxTime,
      serviceArea,
      requirements 
    } = body;

    if (!name || basePrice === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create delivery zone
    const deliveryZone = await db.deliveryZone.create({
      data: {
        name,
        description: description || '',
        basePrice: parseFloat(basePrice),
        pricePerMile: pricePerMile ? parseFloat(pricePerMile) : 0,
        pricePerMinute: pricePerMinute ? parseFloat(pricePerMinute) : 0,
        maxDistance: maxDistance ? parseFloat(maxDistance) : null,
        maxTime: maxTime ? parseInt(maxTime) : null,
        serviceArea: serviceArea || {
          type: 'RADIUS',
          center: { lat: 0, lng: 0 },
          radius: 10
        },
        requirements: requirements || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      deliveryZone,
      message: "Delivery zone created successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_ZONE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zoneId = searchParams.get('zoneId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (zoneId) {
      whereClause.id = zoneId;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    // Get delivery zones
    const [zones, totalCount] = await Promise.all([
      db.deliveryZone.findMany({
        where: whereClause,
        include: {
          deliveryRequests: {
            where: {
              status: 'DELIVERED'
            },
            take: 5,
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryZone.count({ where: whereClause })
    ]);

    return NextResponse.json({
      zones,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_ZONE_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      zoneId, 
      name, 
      description, 
      basePrice, 
      pricePerMile, 
      pricePerMinute,
      maxDistance,
      maxTime,
      serviceArea,
      requirements,
      isActive 
    } = body;

    if (!zoneId) {
      return new NextResponse("Zone ID is required", { status: 400 });
    }

    // Update delivery zone
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (pricePerMile !== undefined) updateData.pricePerMile = parseFloat(pricePerMile);
    if (pricePerMinute !== undefined) updateData.pricePerMinute = parseFloat(pricePerMinute);
    if (maxDistance !== undefined) updateData.maxDistance = parseFloat(maxDistance);
    if (maxTime !== undefined) updateData.maxTime = parseInt(maxTime);
    if (serviceArea !== undefined) updateData.serviceArea = serviceArea;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedZone = await db.deliveryZone.update({
      where: { id: zoneId },
      data: updateData
    });

    return NextResponse.json({
      deliveryZone: updatedZone,
      message: "Delivery zone updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_ZONE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zoneId = searchParams.get('zoneId');

    if (!zoneId) {
      return new NextResponse("Zone ID is required", { status: 400 });
    }

    // Delete delivery zone
    const deletedZone = await db.deliveryZone.delete({
      where: { id: zoneId }
    });

    return NextResponse.json({
      deliveryZone: deletedZone,
      message: "Delivery zone deleted successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_ZONE_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      zoneId, 
      customerLat, 
      customerLng, 
      deliveryAddress 
    } = body;

    if (!zoneId || !customerLat || !customerLng) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get delivery zone
    const deliveryZone = await db.deliveryZone.findUnique({
      where: { id: zoneId }
    });

    if (!deliveryZone) {
      return new NextResponse("Delivery zone not found", { status: 404 });
    }

    // Check if customer is within service area
    const isWithinServiceArea = checkServiceArea(
      parseFloat(customerLat),
      parseFloat(customerLng),
      deliveryZone.serviceArea
    );

    if (!isWithinServiceArea) {
      return NextResponse.json({
        isWithinServiceArea: false,
        message: "Address is outside delivery zone"
      });
    }

    // Calculate delivery cost
    const distance = calculateDistance(
      parseFloat(customerLat),
      parseFloat(customerLng),
      deliveryZone.serviceArea.center.lat,
      deliveryZone.serviceArea.center.lng
    );

    const estimatedTime = Math.ceil(distance * 3); // 3 minutes per mile
    const deliveryCost = calculateDeliveryCost(
      deliveryZone,
      distance,
      estimatedTime
    );

    return NextResponse.json({
      isWithinServiceArea: true,
      deliveryZone: {
        id: deliveryZone.id,
        name: deliveryZone.name,
        basePrice: deliveryZone.basePrice,
        pricePerMile: deliveryZone.pricePerMile,
        pricePerMinute: deliveryZone.pricePerMinute
      },
      pricing: {
        distance,
        estimatedTime,
        deliveryCost,
        breakdown: {
          basePrice: deliveryZone.basePrice,
          distanceCost: distance * deliveryZone.pricePerMile,
          timeCost: estimatedTime * deliveryZone.pricePerMinute,
          total: deliveryCost
        }
      }
    });

  } catch (error) {
    console.error("[DELIVERY_ZONE_PRICING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

function checkServiceArea(
  customerLat: number, 
  customerLng: number, 
  serviceArea: any
): boolean {
  if (serviceArea.type === 'RADIUS') {
    const distance = calculateDistance(
      customerLat, customerLng,
      serviceArea.center.lat, serviceArea.center.lng
    );
    return distance <= serviceArea.radius;
  } else if (serviceArea.type === 'POLYGON') {
    // Simplified polygon check - would need proper geospatial library
    return true; // Placeholder
  }
  return false;
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

function calculateDeliveryCost(
  zone: any, 
  distance: number, 
  time: number
): number {
  let cost = zone.basePrice;
  
  if (zone.pricePerMile > 0) {
    cost += distance * zone.pricePerMile;
  }
  
  if (zone.pricePerMinute > 0) {
    cost += time * zone.pricePerMinute;
  }
  
  return cost;
}
