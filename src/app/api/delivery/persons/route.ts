import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      email, 
      phone, 
      vehicle, 
      licensePlate,
      vehicleColor,
      maxDeliveries,
      workingHours,
      serviceArea,
      documents 
    } = body;

    if (!name || !email || !phone) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create delivery person
    const deliveryPerson = await db.deliveryPerson.create({
      data: {
        name,
        email,
        phone,
        vehicle: vehicle || 'CAR',
        licensePlate: licensePlate || '',
        vehicleColor: vehicleColor || '',
        maxDeliveries: maxDeliveries || 10,
        workingHours: workingHours || {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '10:00', end: '16:00' },
          sunday: { start: 'closed', end: 'closed' }
        },
        serviceArea: serviceArea || {
          type: 'RADIUS',
          center: { lat: 0, lng: 0 },
          radius: 10 // miles
        },
        documents: documents || [],
        status: 'ACTIVE',
        rating: 5.0,
        totalDeliveries: 0,
        onTimeDeliveries: 0,
        currentLocation: null,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      deliveryPerson,
      message: "Delivery person created successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_PERSON_CREATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deliveryPersonId = searchParams.get('deliveryPersonId');
    const status = searchParams.get('status');
    const isAvailable = searchParams.get('isAvailable');
    const serviceArea = searchParams.get('serviceArea');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (deliveryPersonId) {
      whereClause.id = deliveryPersonId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (isAvailable !== null) {
      whereClause.isAvailable = isAvailable === 'true';
    }

    // Get delivery persons
    const [deliveryPersons, totalCount] = await Promise.all([
      db.deliveryPerson.findMany({
        where: whereClause,
        include: {
          deliveryRequests: {
            where: {
              status: {
                in: ['ASSIGNED', 'IN_PROGRESS', 'DELIVERED']
              }
            },
            take: 5,
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          rating: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryPerson.count({ where: whereClause })
    ]);

    // Filter by service area if specified
    let filteredDeliveryPersons = deliveryPersons;
    if (serviceArea) {
      const { lat, lng } = JSON.parse(serviceArea);
      filteredDeliveryPersons = deliveryPersons.filter(person => {
        if (person.serviceArea.type === 'RADIUS') {
          const distance = calculateDistance(
            lat, lng,
            person.serviceArea.center.lat,
            person.serviceArea.center.lng
          );
          return distance <= person.serviceArea.radius;
        }
        return true;
      });
    }

    return NextResponse.json({
      deliveryPersons: filteredDeliveryPersons,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_PERSON_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryPersonId, 
      status, 
      isAvailable, 
      currentLocation,
      workingHours,
      serviceArea,
      maxDeliveries 
    } = body;

    if (!deliveryPersonId) {
      return new NextResponse("Delivery person ID is required", { status: 400 });
    }

    // Update delivery person
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) updateData.status = status;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (currentLocation !== undefined) updateData.currentLocation = currentLocation;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (serviceArea !== undefined) updateData.serviceArea = serviceArea;
    if (maxDeliveries !== undefined) updateData.maxDeliveries = maxDeliveries;

    const updatedDeliveryPerson = await db.deliveryPerson.update({
      where: { id: deliveryPersonId },
      data: updateData
    });

    return NextResponse.json({
      deliveryPerson: updatedDeliveryPerson,
      message: "Delivery person updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_PERSON_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deliveryPersonId = searchParams.get('deliveryPersonId');

    if (!deliveryPersonId) {
      return new NextResponse("Delivery person ID is required", { status: 400 });
    }

    // Soft delete by setting status to INACTIVE
    const deletedDeliveryPerson = await db.deliveryPerson.update({
      where: { id: deliveryPersonId },
      data: {
        status: 'INACTIVE',
        isAvailable: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      deliveryPerson: deletedDeliveryPerson,
      message: "Delivery person deactivated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_PERSON_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
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
