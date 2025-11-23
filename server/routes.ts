import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { insertProductSchema, insertOrderSchema, insertCustomBraceletConfigurationSchema, insertCustomNecklaceConfigurationSchema, insertCouponSchema } from "@shared/schema";
import { requireAdmin } from "./auth-middleware";
import PDFDocument from "pdfkit";

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });
  console.log("✓ Stripe initialized successfully");
} else {
  console.warn("⚠ Stripe not initialized - payment processing will be disabled. Please provide STRIPE_SECRET_KEY.");
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating product: " + error.message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating product: " + error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product: " + error.message });
    }
  });

  app.patch("/api/products/:id/inventory", requireAdmin, async (req, res) => {
    try {
      const { quantityChange } = req.body;
      
      if (typeof quantityChange !== 'number') {
        return res.status(400).json({ message: "quantityChange must be a number" });
      }

      const product = await storage.updateProductInventory(req.params.id, quantityChange);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating inventory: " + error.message });
    }
  });

  app.patch("/api/products/:id/price", requireAdmin, async (req, res) => {
    try {
      const { price } = req.body;
      
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ message: "price must be a non-negative number" });
      }

      const product = await storage.updateProduct(req.params.id, { price: price.toFixed(2) });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating price: " + error.message });
    }
  });

  app.get("/api/bracelet-templates", async (req, res) => {
    try {
      const templates = await storage.getAllBraceletTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching bracelet templates: " + error.message });
    }
  });

  app.get("/api/bracelet-templates/:id", async (req, res) => {
    try {
      const template = await storage.getBraceletTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Bracelet template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching bracelet template: " + error.message });
    }
  });

  app.get("/api/charms", async (req, res) => {
    try {
      const charms = await storage.getAllCharms();
      res.json(charms);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching charms: " + error.message });
    }
  });

  app.get("/api/charms/:id", async (req, res) => {
    try {
      const charm = await storage.getCharm(req.params.id);
      if (!charm) {
        return res.status(404).json({ message: "Charm not found" });
      }
      res.json(charm);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching charm: " + error.message });
    }
  });

  app.get("/api/bracelet-beads", async (req, res) => {
    try {
      const beads = await storage.getAllBraceletBeads();
      res.json(beads);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching bracelet beads: " + error.message });
    }
  });

  app.post("/api/custom-bracelet", async (req, res) => {
    try {
      const validatedData = insertCustomBraceletConfigurationSchema.parse(req.body);
      const config = await storage.createCustomBraceletConfiguration(validatedData);
      res.status(201).json(config);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating custom bracelet: " + error.message });
    }
  });

  app.get("/api/custom-bracelet/:id", async (req, res) => {
    try {
      const config = await storage.getCustomBraceletConfiguration(req.params.id);
      if (!config) {
        return res.status(404).json({ message: "Custom bracelet configuration not found" });
      }
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching custom bracelet: " + error.message });
    }
  });

  app.get("/api/necklace-templates", async (req, res) => {
    try {
      const templates = await storage.getAllNecklaceTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching necklace templates: " + error.message });
    }
  });

  app.get("/api/necklace-templates/:id", async (req, res) => {
    try {
      const template = await storage.getNecklaceTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Necklace template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching necklace template: " + error.message });
    }
  });

  app.post("/api/custom-necklace", async (req, res) => {
    try {
      const validatedData = insertCustomNecklaceConfigurationSchema.parse(req.body);
      const config = await storage.createCustomNecklaceConfiguration(validatedData);
      res.status(201).json(config);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating custom necklace: " + error.message });
    }
  });

  app.get("/api/custom-necklace/:id", async (req, res) => {
    try {
      const config = await storage.getCustomNecklaceConfiguration(req.params.id);
      if (!config) {
        return res.status(404).json({ message: "Custom necklace configuration not found" });
      }
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching custom necklace: " + error.message });
    }
  });

  app.get("/api/payment-intent/:id", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is not available." 
        });
      }

      const paymentIntent: any = await stripe.paymentIntents.retrieve(req.params.id);
      
      const taxAmount = paymentIntent.amount_details?.total_details?.amount_tax 
        ? paymentIntent.amount_details.total_details.amount_tax / 100 
        : 0;
      
      res.json({
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        taxAmount,
        status: paymentIntent.status,
      });
    } catch (error: any) {
      console.error("Error retrieving payment intent:", error);
      res.status(500).json({ 
        message: "Error retrieving payment intent: " + error.message 
      });
    }
  });

  // Coupon routes
  app.get("/api/coupons/validate/:code", async (req, res) => {
    try {
      const coupon = await storage.getCouponByCode(req.params.code);
      if (!coupon) {
        return res.status(404).json({ valid: false, message: "Coupon code not found" });
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        return res.json({ valid: false, message: "This coupon is no longer active" });
      }

      // Check usage limits
      if (coupon.maxUsage && coupon.currentUsage >= coupon.maxUsage) {
        return res.json({ valid: false, message: "This coupon has reached its usage limit" });
      }

      // Check date validity
      const now = new Date();
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        return res.json({ valid: false, message: "This coupon is not yet valid" });
      }
      if (coupon.endDate && new Date(coupon.endDate) < now) {
        return res.json({ valid: false, message: "This coupon has expired" });
      }

      res.json({
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minimumPurchase: coupon.minimumPurchase,
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error validating coupon: " + error.message });
    }
  });

  app.get("/api/coupons", requireAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching coupons: " + error.message });
    }
  });

  app.post("/api/coupons", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating coupon: " + error.message });
    }
  });

  app.patch("/api/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating coupon: " + error.message });
    }
  });

  app.delete("/api/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCoupon(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting coupon: " + error.message });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is not available. Stripe API keys are not configured." 
        });
      }

      const { amount, customerAddress, cart } = req.body;

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      console.log(`Creating payment intent for amount: $${amount}`);
      
      const paymentIntentParams: any = {
        amount: Math.round(parseFloat(amount) * 100),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (customerAddress) {
        paymentIntentParams.shipping = {
          name: customerAddress.name || "Customer",
          address: {
            line1: customerAddress.address || "",
            city: customerAddress.city || "",
            state: customerAddress.state || "",
            postal_code: customerAddress.zipCode || "",
            country: "US",
          },
        };
      }
      
      const paymentIntent: any = await stripe.paymentIntents.create(paymentIntentParams);

      console.log(`Payment intent created: ${paymentIntent.id}`);
      
      const taxAmount = paymentIntent.amount_details?.total_details?.amount_tax 
        ? paymentIntent.amount_details.total_details.amount_tax / 100 
        : 0;
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        taxAmount,
        totalAmount: paymentIntent.amount / 100,
      });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message,
        details: error.type || "unknown_error"
      });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      
      // Parse order items to subtract inventory
      const items = JSON.parse(validatedData.items);
      
      // Subtract inventory for each product in the order
      for (const item of items) {
        if (item.product && item.product.id) {
          // Only subtract inventory for regular products (not custom bracelets/necklaces)
          const quantityToSubtract = -item.quantity; // Negative to subtract
          await storage.updateProductInventory(item.product.id, quantityToSubtract);
        }
      }
      
      // Increment coupon usage if a coupon was used
      if (req.body.couponCode) {
        await storage.incrementCouponUsage(req.body.couponCode);
      }
      
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating order: " + error.message });
    }
  });

  app.get("/api/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  app.get("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching order: " + error.message });
    }
  });

  app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating order: " + error.message });
    }
  });

  app.post("/api/orders/:id/shipping-label", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (!process.env.SHIPPO_API_KEY) {
        return res.status(503).json({
          message: "Shipping label service not configured. Please add SHIPPO_API_KEY to secrets.",
        });
      }

      const shippoApiKey = process.env.SHIPPO_API_KEY;
      const shippoUrl = "https://api.goshippo.com/shipments/";

      const shipmentData = {
        address_from: {
          name: "WOW by Dany",
          street1: process.env.SHIP_FROM_ADDRESS || "123 Main St",
          city: process.env.SHIP_FROM_CITY || "Los Angeles",
          state: process.env.SHIP_FROM_STATE || "CA",
          zip: process.env.SHIP_FROM_ZIP || "90001",
          country: "US",
        },
        address_to: {
          name: order.customerName,
          street1: order.shippingAddress,
          city: order.city,
          state: order.state,
          zip: order.zipCode,
          country: "US",
        },
        parcels: [
          {
            length: "5",
            width: "5",
            height: "2",
            distance_unit: "in",
            weight: "8",
            mass_unit: "oz",
          },
        ],
        async: false,
      };

      const shipmentResponse = await fetch(shippoUrl, {
        method: "POST",
        headers: {
          "Authorization": `ShippoToken ${shippoApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentData),
      });

      if (!shipmentResponse.ok) {
        const errorText = await shipmentResponse.text();
        throw new Error(`Shippo API error: ${errorText}`);
      }

      const shipment = await shipmentResponse.json();

      if (!shipment.rates || shipment.rates.length === 0) {
        throw new Error("No shipping rates available");
      }

      const cheapestRate = shipment.rates.reduce((prev: any, curr: any) =>
        parseFloat(prev.amount) < parseFloat(curr.amount) ? prev : curr
      );

      const transactionResponse = await fetch("https://api.goshippo.com/transactions/", {
        method: "POST",
        headers: {
          "Authorization": `ShippoToken ${shippoApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rate: cheapestRate.object_id,
          label_file_type: "PDF",
          async: false,
        }),
      });

      if (!transactionResponse.ok) {
        const errorText = await transactionResponse.text();
        throw new Error(`Shippo transaction error: ${errorText}`);
      }

      const transaction = await transactionResponse.json();
      
      // Debug: Log the full Shippo transaction response
      console.log("=== SHIPPO TRANSACTION RESPONSE ===");
      console.log(JSON.stringify(transaction, null, 2));
      console.log("=== END SHIPPO RESPONSE ===");
      
      // Check transaction status and messages
      console.log(`Transaction status: ${transaction.status}`);
      console.log(`Transaction messages:`, transaction.messages);
      
      if (transaction.status === "ERROR" || transaction.status === "INVALID") {
        const errorMessages = transaction.messages?.map((m: any) => m.text || m).join(", ") || "Unknown error";
        throw new Error(`Shippo transaction failed: ${errorMessages}`);
      }
      
      if (transaction.status === "QUEUED" || transaction.status === "PENDING") {
        throw new Error(`Shippo transaction is still processing (status: ${transaction.status}). Please try again in a few moments.`);
      }
      
      if (transaction.status !== "SUCCESS") {
        const messages = transaction.messages?.map((m: any) => m.text || m).join(", ") || "No details provided";
        throw new Error(`Shippo transaction has status '${transaction.status}'. Details: ${messages}`);
      }
      
      // Shippo test mode returns label_url as null - use label_uri instead
      const labelUrl = transaction.label_url || transaction.label_uri;
      const trackingNumber = transaction.tracking_number;
      
      console.log(`Label URL value: "${labelUrl}" (type: ${typeof labelUrl})`);
      console.log(`Label URI value: "${transaction.label_uri}"`);
      console.log(`Tracking number: "${trackingNumber}"`);
      
      if (!labelUrl || labelUrl === null || labelUrl === "") {
        throw new Error(`Shippo returned null for both label_url and label_uri. This may be a test mode limitation. Check your Shippo account settings or contact Shippo support.`);
      }
      
      if (!trackingNumber) {
        throw new Error("Shippo did not return a tracking number.");
      }

      const updatedOrder = await storage.updateShippingLabel(
        order.id,
        trackingNumber,
        labelUrl,
        cheapestRate.provider
      );

      res.json({
        success: true,
        labelUrl: labelUrl,
        trackingNumber: trackingNumber,
        carrier: cheapestRate.provider,
        order: updatedOrder,
      });
    } catch (error: any) {
      console.error("Shipping label error:", error);
      res.status(500).json({ message: "Error generating shipping label: " + error.message });
    }
  });

  app.post("/api/orders/:id/notify", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (!process.env.SENDGRID_API_KEY) {
        return res.status(503).json({
          message: "Email service not configured. Please add SENDGRID_API_KEY to secrets.",
        });
      }

      const sendgridApiKey = process.env.SENDGRID_API_KEY;
      const items = JSON.parse(order.items);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3a362f;">Order Shipped - Tracking Available</h2>
          <p>Dear ${order.customerName},</p>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          ${order.trackingNumber ? `
            <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0;"><strong>Tracking Number:</strong></p>
              <p style="font-size: 18px; font-family: monospace; margin: 5px 0;">${order.trackingNumber}</p>
              ${order.shippingCarrier ? `<p style="margin: 0;"><strong>Carrier:</strong> ${order.shippingCarrier.toUpperCase()}</p>` : ''}
            </div>
          ` : ''}

          <h3>Order Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${items.map((item: any) => `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  ${item.product.name} x ${item.quantity}
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
                  $${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                </td>
              </tr>
            `).join('')}
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Total</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">
                $${parseFloat(order.totalAmount).toFixed(2)}
              </td>
            </tr>
          </table>

          <p style="margin-top: 20px;">Thank you for shopping with WOW Jewelry!</p>
          <p style="color: #666; font-size: 12px;">
            If you have any questions, please contact us at jewelryboutiquewow@gmail.com
          </p>
        </div>
      `;

      const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: order.customerEmail, name: order.customerName }],
              subject: order.trackingNumber
                ? `Your WOW Jewelry Order Has Shipped! 📦`
                : `Order Confirmation - WOW Jewelry`,
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || "orders@wowjewelry.com",
            name: "WOW by Dany",
          },
          content: [
            {
              type: "text/html",
              value: emailHtml,
            },
          ],
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        throw new Error(`SendGrid API error: ${errorText}`);
      }

      res.json({ success: true, message: "Email sent successfully" });
    } catch (error: any) {
      console.error("Email notification error:", error);
      res.status(500).json({ message: "Error sending email: " + error.message });
    }
  });

  // Generate November invoice PDF
  app.get("/api/generate-invoice-november", async (req, res) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="WOW-Jewelry-Invoice-November-2025.pdf"');

      // Pipe PDF to response
      doc.pipe(res);

      // Invoice Header
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'left' });
      doc.moveDown(0.5);
      
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice #: INV-${Date.now()}`, { align: 'left' });
      doc.text('Date: November 5, 2025', { align: 'left' });
      doc.text('Due Date: Upon Receipt', { align: 'left' });
      doc.moveDown(2);

      // From and Bill To sections
      const fromX = 50;
      const billToX = 320;
      const currentY = doc.y;

      // FROM section
      doc.fontSize(10).font('Helvetica-Bold').text('FROM:', fromX, currentY);
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      doc.text('Titan Innovations LLC', fromX, doc.y);
      doc.text('Professional Website Development', fromX, doc.y);
      doc.text('Full-Stack E-Commerce Solutions', fromX, doc.y);

      // BILL TO section
      doc.fontSize(10).font('Helvetica-Bold').text('BILL TO:', billToX, currentY);
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      doc.text('WOW by Dany', billToX, doc.y);
      doc.text('Jewelry E-Commerce Store', billToX, doc.y);
      doc.text('Online Retail Business', billToX, doc.y);

      doc.moveDown(3);

      // Table Header
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('DESCRIPTION', 50, tableTop, { width: 280 });
      doc.text('QTY', 330, tableTop, { width: 50, align: 'center' });
      doc.text('RATE', 380, tableTop, { width: 80, align: 'right' });
      doc.text('AMOUNT', 460, tableTop, { width: 90, align: 'right' });
      
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Line items
      const items = [
        { desc: 'Custom Bracelet Builder Implementation\nInteractive 3-step builder, charm & bead selection, live pricing', qty: 1, rate: 65.00 },
        { desc: 'Admin Dashboard with Authentication\nSecure admin panel, order management, tabbed interface', qty: 1, rate: 50.00 },
        { desc: 'Shippo Shipping Label Integration\nAutomated label generation, multi-carrier support, PDF downloads', qty: 1, rate: 55.00 },
        { desc: 'SendGrid Email Notification System\nOrder confirmations, shipping notifications, HTML templates', qty: 1, rate: 40.00 },
        { desc: 'Real-Time Inventory Management System\nStock tracking, automatic deduction, manual adjustments', qty: 1, rate: 40.00 }
      ];

      doc.font('Helvetica').fontSize(9);
      items.forEach((item) => {
        const itemY = doc.y;
        doc.text(item.desc, 50, itemY, { width: 280 });
        doc.text(item.qty.toString(), 330, itemY, { width: 50, align: 'center' });
        doc.text(`$${item.rate.toFixed(2)}`, 380, itemY, { width: 80, align: 'right' });
        doc.text(`$${item.rate.toFixed(2)}`, 460, itemY, { width: 90, align: 'right' });
        doc.moveDown(1.8);
      });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Totals
      doc.fontSize(10).font('Helvetica');
      doc.text('Subtotal:', 380, doc.y, { width: 80, align: 'right' });
      doc.text('$250.00', 460, doc.y, { width: 90, align: 'right' });
      doc.moveDown(0.5);

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('TOTAL:', 380, doc.y, { width: 80, align: 'right' });
      doc.text('$250.00', 460, doc.y, { width: 90, align: 'right' });

      doc.moveDown(2);

      // Payment Terms
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Payment Terms', 50, doc.y);
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica');
      doc.text('• Payment is due upon receipt of this invoice', 50, doc.y);
      doc.text('• All work has been completed and delivered as of November 5, 2025', 50, doc.y);
      doc.text('• Features fully functional with production-ready integrations', 50, doc.y);
      doc.moveDown(1.5);

      // Payment Methods
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Payment Methods Accepted', 50, doc.y);
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica');
      doc.text('• Zelle', 50, doc.y);
      doc.text('• Cash', 50, doc.y);
      doc.text('• Apple Pay', 50, doc.y);
      doc.text('• Credit/Debit Card', 50, doc.y);
      doc.text('• Bank Transfer', 50, doc.y);
      doc.moveDown(2);

      // Project Summary
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Project Summary', 50, doc.y);
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica');
      doc.text('WOW by Dany - Enhanced E-Commerce Features', 50, doc.y);
      doc.text('Custom builders, shipping automation, and inventory management', 50, doc.y);
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Thank you for your business!', 50, doc.y);

      // Finalize PDF
      doc.end();
    } catch (error: any) {
      console.error("Invoice generation error:", error);
      res.status(500).json({ message: "Error generating invoice: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
