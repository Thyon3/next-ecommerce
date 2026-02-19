import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      deliveryRequestId, 
      type, 
      message,
      recipient,
      channels 
    } = body;

    if (!deliveryRequestId || !type || !message) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get delivery request details
    const deliveryRequest = await db.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
      include: {
        user: true,
        deliveryPerson: true,
        order: true
      }
    });

    if (!deliveryRequest) {
      return new NextResponse("Delivery request not found", { status: 404 });
    }

    // Create notification
    const notification = await db.deliveryNotification.create({
      data: {
        deliveryRequestId,
        type,
        message,
        recipient: recipient || 'CUSTOMER',
        channels: channels || ['EMAIL', 'SMS'],
        status: 'PENDING',
        metadata: {
          deliveryId: deliveryRequest.id,
          orderId: deliveryRequest.orderId,
          customerName: deliveryRequest.user?.name,
          customerEmail: deliveryRequest.user?.email,
          customerPhone: deliveryRequest.contactPhone,
          deliveryPersonName: deliveryRequest.deliveryPerson?.name,
          deliveryPersonPhone: deliveryRequest.deliveryPerson?.phone
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Send notifications based on type and channels
    await sendNotifications(notification, deliveryRequest);

    return NextResponse.json({
      notification,
      message: "Notification sent successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_NOTIFICATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('notificationId');
    const deliveryRequestId = searchParams.get('deliveryRequestId');
    const recipient = searchParams.get('recipient');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const whereClause: any = {};

    if (notificationId) {
      whereClause.id = notificationId;
    }

    if (deliveryRequestId) {
      whereClause.deliveryRequestId = deliveryRequestId;
    }

    if (recipient) {
      whereClause.recipient = recipient;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get notifications
    const [notifications, totalCount] = await Promise.all([
      db.deliveryNotification.findMany({
        where: whereClause,
        include: {
          deliveryRequest: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              deliveryPerson: {
                select: {
                  id: true,
                  name: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryNotification.count({ where: whereClause })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("[DELIVERY_NOTIFICATION_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      notificationId, 
      status, 
      sentAt,
      error 
    } = body;

    if (!notificationId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update notification
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (sentAt !== undefined) updateData.sentAt = new Date(sentAt);
    if (error !== undefined) updateData.error = error;

    const updatedNotification = await db.deliveryNotification.update({
      where: { id: notificationId },
      data: updateData
    });

    return NextResponse.json({
      notification: updatedNotification,
      message: "Notification updated successfully"
    });

  } catch (error) {
    console.error("[DELIVERY_NOTIFICATION_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

async function sendNotifications(notification: any, deliveryRequest: any) {
  try {
    const { channels, metadata } = notification;
    
    for (const channel of channels) {
      switch (channel) {
        case 'EMAIL':
          await sendEmailNotification(notification, deliveryRequest);
          break;
        case 'SMS':
          await sendSMSNotification(notification, deliveryRequest);
          break;
        case 'PUSH':
          await sendPushNotification(notification, deliveryRequest);
          break;
        case 'WHATSAPP':
          await sendWhatsAppNotification(notification, deliveryRequest);
          break;
      }
    }

    // Update notification status
    await db.deliveryNotification.update({
      where: { id: notification.id },
      data: {
        status: 'SENT',
        sentAt: new Date()
      }
    });

  } catch (error) {
    console.error("[SEND_NOTIFICATIONS_ERROR]", error);
    
    // Update notification with error
    await db.deliveryNotification.update({
      where: { id: notification.id },
      data: {
        status: 'FAILED',
        error: error.message
      }
    });
  }
}

async function sendEmailNotification(notification: any, deliveryRequest: any) {
  // This would integrate with your email service
  console.log(`Sending email notification: ${notification.message}`);
  
  // Example email content based on notification type
  const emailContent = generateEmailContent(notification, deliveryRequest);
  
  // Send email using your email service
  // await emailService.send({
  //   to: metadata.customerEmail,
  //   subject: emailContent.subject,
  //   html: emailContent.html,
  //   text: emailContent.text
  // });
}

async function sendSMSNotification(notification: any, deliveryRequest: any) {
  // This would integrate with your SMS service
  console.log(`Sending SMS notification: ${notification.message}`);
  
  // Example SMS content
  const smsContent = generateSMSContent(notification, deliveryRequest);
  
  // Send SMS using your SMS service
  // await smsService.send({
  //   to: metadata.customerPhone,
  //   message: smsContent
  // });
}

async function sendPushNotification(notification: any, deliveryRequest: any) {
  // This would integrate with your push notification service
  console.log(`Sending push notification: ${notification.message}`);
  
  // Send push notification
  // await pushService.send({
  //   to: metadata.customerId,
  //   title: 'Delivery Update',
  //   body: notification.message,
  //   data: {
  //     deliveryId: deliveryRequest.id
  //   }
  // });
}

async function sendWhatsAppNotification(notification: any, deliveryRequest: any) {
  // This would integrate with your WhatsApp service
  console.log(`Sending WhatsApp notification: ${notification.message}`);
  
  // Send WhatsApp message
  // await whatsappService.send({
  //   to: metadata.customerPhone,
  //   message: notification.message
  // });
}

function generateEmailContent(notification: any, deliveryRequest: any) {
  const { type, message } = notification;
  
  switch (type) {
    case 'DELIVERY_ASSIGNED':
      return {
        subject: 'Delivery Assigned',
        html: `
          <h2>Your delivery has been assigned!</h2>
          <p>${message}</p>
          <p>Delivery ID: ${deliveryRequest.id.slice(-8)}</p>
          <p>Estimated delivery: ${new Date(deliveryRequest.estimatedDeliveryTime).toLocaleString()}</p>
        `,
        text: `${message}\nDelivery ID: ${deliveryRequest.id.slice(-8)}`
      };
    
    case 'DELIVERY_IN_PROGRESS':
      return {
        subject: 'Delivery In Progress',
        html: `
          <h2>Your delivery is on the way!</h2>
          <p>${message}</p>
          <p>Delivery ID: ${deliveryRequest.id.slice(-8)}</p>
        `,
        text: `${message}\nDelivery ID: ${deliveryRequest.id.slice(-8)}`
      };
    
    case 'DELIVERY_COMPLETED':
      return {
        subject: 'Delivery Completed',
        html: `
          <h2>Your delivery has been completed!</h2>
          <p>${message}</p>
          <p>Delivery ID: ${deliveryRequest.id.slice(-8)}</p>
          <p>Thank you for your business!</p>
        `,
        text: `${message}\nDelivery ID: ${deliveryRequest.id.slice(-8)}`
      };
    
    default:
      return {
        subject: 'Delivery Update',
        html: `<p>${message}</p>`,
        text: message
      };
  }
}

function generateSMSContent(notification: any, deliveryRequest: any) {
  const { message } = notification;
  return `${message} - Delivery ID: ${deliveryRequest.id.slice(-8)}`;
}
