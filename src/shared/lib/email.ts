import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
export const emailTemplates = {
  orderConfirmation: (order: any, user: any) => ({
    subject: `Order Confirmation #${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: white; padding: 20px; text-align: center;">
          <h1>Bitex</h1>
          <p>Order Confirmation</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Thank you for your order!</h2>
          <p>Hi ${user.name || 'Valued Customer'},</p>
          <p>Your order has been successfully placed and is now being processed.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress.street}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.postalCode}</p>
            <p>${order.shippingAddress.country}</p>
          </div>
          
          <h3>Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
            ${order.items.map((item: any) => `
              <tr>
                <td style="padding: 10px;">${item.product?.name || 'Product'}</td>
                <td style="padding: 10px;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          
          <div style="margin-top: 30px;">
            <p>You can track your order status by visiting our website or contacting our customer service.</p>
            <p>Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin-top: 20px;">
          <p>&copy; 2024 Bitex. All rights reserved.</p>
          <p>Need help? Contact us at support@bitex.com</p>
        </div>
      </div>
    `,
  }),

  orderShipped: (order: any, trackingNumber: string) => ({
    subject: `Your Order #${order.id} Has Been Shipped!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: white; padding: 20px; text-align: center;">
          <h1>Bitex</h1>
          <p>Order Shipped</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Good news! Your order is on its way!</h2>
          <p>Your order has been shipped and you can track its progress.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
            <h3>Tracking Information</h3>
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p><strong>Carrier:</strong> Bitex Shipping</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Track Your Order
            </a>
          </div>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin-top: 20px;">
          <p>&copy; 2024 Bitex. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  orderDelivered: (order: any) => ({
    subject: `Your Order #${order.id} Has Been Delivered!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #000; color: white; padding: 20px; text-align: center;">
          <h1>Bitex</h1>
          <p>Order Delivered</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Your order has been delivered!</h2>
          <p>Thank you for shopping with Bitex. We hope you enjoy your purchase!</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Delivered on:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Leave a Review
            </a>
          </div>
          
          <p>Questions about your order? Reply to this email or contact our support team.</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin-top: 20px;">
          <p>&copy; 2024 Bitex. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@bitex.com',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order: any, user: any) => {
  if (!user.email) {
    console.error('No email address found for user');
    return { success: false, error: 'No email address' };
  }

  const template = emailTemplates.orderConfirmation(order, user);
  return await sendEmail(user.email, template.subject, template.html);
};

// Send order shipped email
export const sendOrderShippedEmail = async (order: any, user: any, trackingNumber: string) => {
  if (!user.email) {
    console.error('No email address found for user');
    return { success: false, error: 'No email address' };
  }

  const template = emailTemplates.orderShipped(order, trackingNumber);
  return await sendEmail(user.email, template.subject, template.html);
};

// Send order delivered email
export const sendOrderDeliveredEmail = async (order: any, user: any) => {
  if (!user.email) {
    console.error('No email address found for user');
    return { success: false, error: 'No email address' };
  }

  const template = emailTemplates.orderDelivered(order);
  return await sendEmail(user.email, template.subject, template.html);
};
