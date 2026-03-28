// Email service using nodemailer (SMTP)
// Supports Gmail SMTP, AWS SES SMTP, or any SMTP provider
import nodemailer from 'nodemailer';

const STORE_EMAIL = 'jewelryboutiquewow@gmail.com';

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || STORE_EMAIL;
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    throw new Error('SMTP_PASS environment variable is required for email');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendEmail(to: string, subject: string, text: string) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"WOW by Dany" <${process.env.SMTP_USER || STORE_EMAIL}>`;

  const result = await transporter.sendMail({ from, to, subject, text });
  console.log('Email sent:', result.messageId);
  return result;
}

// Send order notification email
export async function sendOrderNotification(orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: string;
  items: Array<{ name: string; quantity: number; price: string; charmNames?: string[]; beadNames?: string[] }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shippingMethod: string;
  paymentMethod?: string;
  couponCode?: string;
  discountAmount?: string;
}) {
  try {
    const itemsList = orderDetails.items.map(item => {
      let itemText = `   * ${item.name} - Quantity: ${item.quantity} - $${item.price}`;
      if (item.charmNames && item.charmNames.length > 0) {
        itemText += '\n      Charms: ' + item.charmNames.join(', ');
      }
      if (item.beadNames && item.beadNames.length > 0) {
        itemText += '\n      Beads: ' + item.beadNames.join(', ');
      }
      return itemText;
    }).join('\n');

    const subject = `New Order #${orderDetails.orderId} - WOW by Dany`;

    const messageBody = `
You have received a new order!

ORDER DETAILS:
--------------
Order ID: #${orderDetails.orderId}
Total Amount: $${orderDetails.total}
${orderDetails.couponCode ? `Coupon Applied: ${orderDetails.couponCode} (Discount: $${orderDetails.discountAmount})` : ''}

CUSTOMER INFORMATION:
--------------------
Name: ${orderDetails.customerName}
Email: ${orderDetails.customerEmail}
Phone: ${orderDetails.customerPhone}

SHIPPING ADDRESS:
----------------
${orderDetails.shippingAddress.street}
${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}

Shipping Method: ${orderDetails.shippingMethod === 'pickup' ? 'LOCAL PICKUP' : 'STANDARD SHIPPING ($5.99)'}

ITEMS ORDERED:
-------------
${itemsList}

${orderDetails.paymentMethod ? `Payment Method: ${orderDetails.paymentMethod}` : ''}

-----
This order is now ready to be packed and shipped!
Please log into the admin dashboard to view full details and generate shipping labels if needed.

Admin Dashboard: ${process.env.APP_URL || 'https://wowbydany.com'}/admin

Have a wonderful day!
WOW by Dany Team
    `.trim();

    // Send to store owner
    const storeEmail = process.env.SMTP_USER || STORE_EMAIL;
    await sendEmail(storeEmail, subject, messageBody);

    console.log('Order notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send order notification email:', error);
    return false;
  }
}

// Send shipping notification email to customer
export async function sendShippingNotification(details: {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: string;
  totalAmount: number;
  trackingNumber?: string;
  shippingCarrier?: string;
}) {
  try {
    const subject = details.trackingNumber
      ? `Your WOW by Dany Order Has Shipped!`
      : `Order Update - WOW by Dany`;

    const trackingSection = details.trackingNumber
      ? `
TRACKING INFORMATION:
--------------------
Tracking Number: ${details.trackingNumber}
${details.shippingCarrier ? `Carrier: ${details.shippingCarrier.toUpperCase()}` : ''}

You can track your package using your tracking number on the carrier's website.
`
      : '';

    const messageBody = `
Dear ${details.customerName},

Great news! Your order from WOW by Dany has been shipped and is on its way to you!
${trackingSection}
SHIPPING ADDRESS:
----------------
${details.shippingAddress}

ORDER DETAILS:
-------------
${details.items}

Total: $${details.totalAmount.toFixed(2)}

Thank you for shopping with WOW by Dany! We hope you love your new jewelry.

If you have any questions, please reply to this email or contact us at ${STORE_EMAIL}

With love,
WOW by Dany Team
    `.trim();

    await sendEmail(details.customerEmail, subject, messageBody);

    console.log('Shipping notification sent to customer');
    return true;
  } catch (error) {
    console.error('Failed to send shipping notification:', error);
    throw error;
  }
}

// Send test email to verify connection
export async function sendTestEmail() {
  try {
    const storeEmail = process.env.SMTP_USER || STORE_EMAIL;
    await sendEmail(
      storeEmail,
      'Test Email - WOW by Dany Order Notifications',
      'This is a test email to confirm that order notifications are working correctly!'
    );
    console.log('Test email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return false;
  }
}
