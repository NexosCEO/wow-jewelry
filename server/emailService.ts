// Gmail Integration - connected via Replit connector
import { google } from 'googleapis';

let connectionSettings: any;
let cachedUserEmail: string | null = null;

async function getConnectionSettings() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

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
  connectionSettings = data.items?.[0];
  
  if (!connectionSettings) {
    throw new Error('Gmail not connected');
  }
  
  return connectionSettings;
}

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  await getConnectionSettings();

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!accessToken) {
    throw new Error('Gmail not connected - no access token');
  }
  return accessToken;
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

// Get the authenticated user's email from connection settings (no API call needed)
async function getUserEmail(): Promise<string> {
  // Try to get email from connection settings first (avoids API call that may fail due to scopes)
  if (!connectionSettings) {
    await getConnectionSettings();
  }
  
  // Try multiple paths to find the email in connection settings
  const email = connectionSettings?.settings?.email || 
                connectionSettings?.settings?.user_email ||
                connectionSettings?.email ||
                connectionSettings?.settings?.oauth?.credentials?.email;
  
  if (email) {
    console.log('Using email from connection settings:', email);
    return email;
  }
  
  // Fallback: try API call (may fail due to scopes)
  try {
    const gmail = await getUncachableGmailClient();
    const profile = await gmail.users.getProfile({ userId: 'me' });
    if (profile.data.emailAddress) {
      console.log('Got email from Gmail API:', profile.data.emailAddress);
      return profile.data.emailAddress;
    }
  } catch (error: any) {
    console.log('Gmail API getProfile failed (expected due to scopes):', error?.message);
  }
  
  // Final fallback: use store email
  console.log('Using fallback store email');
  return 'jewelryboutiquewow@gmail.com';
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
    const gmail = await getUncachableGmailClient();
    const senderEmail = await getUserEmail();
    
    if (!senderEmail) {
      console.error('Could not get sender email address');
      return false;
    }

    // Format items list for email - include charm and bead details for custom bracelets
    const itemsList = orderDetails.items.map(item => {
      let itemText = `   * ${item.name} - Quantity: ${item.quantity} - $${item.price}`;
      
      // Add charm details for custom bracelets
      if (item.charmNames && item.charmNames.length > 0) {
        itemText += '\n      Charms: ' + item.charmNames.join(', ');
      }
      
      // Add bead details for custom bracelets
      if (item.beadNames && item.beadNames.length > 0) {
        itemText += '\n      Beads: ' + item.beadNames.join(', ');
      }
      
      return itemText;
    }).join('\n');

    // Create email content (no emojis - they cause encoding issues in plain text emails)
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