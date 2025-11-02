import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { insertProductSchema, insertOrderSchema, insertCustomBraceletConfigurationSchema } from "@shared/schema";
import { requireAdmin } from "./auth-middleware";

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

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is not available. Stripe API keys are not configured." 
        });
      }

      const { amount } = req.body;

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      console.log(`Creating payment intent for amount: $${amount}`);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(`Payment intent created: ${paymentIntent.id}`);
      res.json({ clientSecret: paymentIntent.client_secret });
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
      
      // Shippo uses label_uri (not label_url) for the PDF URL
      const labelUrl = transaction.label_url;
      const trackingNumber = transaction.tracking_number;
      
      console.log(`Label URL value: "${labelUrl}" (type: ${typeof labelUrl})`);
      console.log(`Tracking number: "${trackingNumber}"`);
      
      if (!labelUrl || labelUrl === null || labelUrl === "") {
        // Provide detailed error with what we got from Shippo
        const availableFields = Object.keys(transaction).join(", ");
        const statusInfo = `Status: ${transaction.status}, Available fields: ${availableFields}`;
        const labelUrlValue = `label_url value: "${labelUrl}"`;
        throw new Error(`Shippo label URL is missing or empty. ${labelUrlValue}. ${statusInfo}. Full response logged to server console.`);
      }
      
      if (!trackingNumber) {
        throw new Error("Shippo did not return a tracking number. Full response logged to server console.");
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

  const httpServer = createServer(app);

  return httpServer;
}
