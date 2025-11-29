import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  // Check if we have a valid cached token
  if (connectionSettings?.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    const cachedToken = connectionSettings.settings.access_token || 
                        connectionSettings.settings?.oauth?.credentials?.access_token;
    if (cachedToken) return cachedToken;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Gmail integration not available - missing authentication token');
  }

  if (!hostname) {
    throw new Error('Gmail integration not available - missing connector hostname');
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    const data = await response.json();
    console.log('Gmail connection response:', JSON.stringify(data, null, 2));
    
    connectionSettings = data.items?.[0];
    
    if (!connectionSettings) {
      throw new Error('Gmail not connected - please add the Gmail integration');
    }
    
    // Try multiple paths to find the access token
    const accessToken = connectionSettings?.settings?.access_token || 
                        connectionSettings?.settings?.oauth?.credentials?.access_token ||
                        connectionSettings?.secrets?.access_token;

    if (!accessToken) {
      console.error('Gmail connection settings:', JSON.stringify(connectionSettings, null, 2));
      throw new Error('Gmail connected but access token not found');
    }
    
    return accessToken;
  } catch (error: any) {
    console.error('Error fetching Gmail connection:', error);
    throw new Error('Gmail not properly configured: ' + error.message);
  }
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Get the authenticated user's email address
async function getUserEmail() {
  try {
    const gmail = await getUncachableGmailClient();
    const profile = await gmail.users.getProfile({ userId: 'me' });
    return profile.data.emailAddress;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

// Send order notification email
export async function sendOrderNotification(orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: string;
  items: Array<{ name: string; quantity: number; price: string }>;
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
    const gmail = await getUncachableGmailClient();
    const senderEmail = await getUserEmail();
    
    if (!senderEmail) {
      console.error('Could not get sender email address');
      return false;
    }

    // Format items list for email
    const itemsList = orderDetails.items.map(item => 
      `   • ${item.name} - Quantity: ${item.quantity} - $${item.price}`
    ).join('\n');

    // Create email content
    const subject = `🎉 New Order #${orderDetails.orderId} - WOW by Dany`;
    
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

Shipping Method: ${orderDetails.shippingMethod === 'pickup' ? '📦 LOCAL PICKUP' : '🚚 STANDARD SHIPPING ($5.99)'}

ITEMS ORDERED:
-------------
${itemsList}

${orderDetails.paymentMethod ? `Payment Method: ${orderDetails.paymentMethod}` : ''}

-----
This order is now ready to be packed and shipped!
Please log into the admin dashboard to view full details and generate shipping labels if needed.

Admin Dashboard: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/admin

Have a wonderful day!
WOW by Dany Team
    `.trim();

    // Encode the message for Gmail API
    const encodedMessage = Buffer.from(
      `From: ${senderEmail}\r\n` +
      `To: ${senderEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
      `${messageBody}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send the email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log('✅ Order notification email sent successfully:', result.data.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order notification email:', error);
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
    const gmail = await getUncachableGmailClient();
    const senderEmail = await getUserEmail();
    
    if (!senderEmail) {
      console.error('Could not get sender email address');
      throw new Error('Gmail not properly configured');
    }

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

If you have any questions, please reply to this email or contact us at jewelryboutiquewow@gmail.com

With love,
WOW by Dany Team
    `.trim();

    const encodedMessage = Buffer.from(
      `From: ${senderEmail}\r\n` +
      `To: ${details.customerEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
      `${messageBody}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log('✅ Shipping notification sent to customer:', result.data.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send shipping notification:', error);
    throw error;
  }
}

// Send test email to verify connection
export async function sendTestEmail() {
  try {
    const gmail = await getUncachableGmailClient();
    const senderEmail = await getUserEmail();
    
    if (!senderEmail) {
      console.error('Could not get sender email address');
      return false;
    }

    const subject = 'Test Email - WOW by Dany Order Notifications';
    const messageBody = 'This is a test email to confirm that order notifications are working correctly!';

    const encodedMessage = Buffer.from(
      `From: ${senderEmail}\r\n` +
      `To: ${senderEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
      `${messageBody}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log('Test email sent successfully:', result.data.id);
    return true;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return false;
  }
}