import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { insertProductSchema, insertOrderSchema, insertCustomBraceletConfigurationSchema, insertCustomNecklaceConfigurationSchema, insertCouponSchema } from "@shared/schema";
import { requireAdmin } from "./auth-middleware";
import PDFDocument from "pdfkit";
import { sendOrderNotification, sendTestEmail } from './emailService';

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
      
      // Get tax amount from metadata (we store it there during creation)
      const taxAmount = paymentIntent.metadata?.tax_amount 
        ? parseFloat(paymentIntent.metadata.tax_amount)
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

      const { customerAddress, cart, couponCode, shippingMethod } = req.body;

      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate subtotal server-side
      let subtotal = 0;
      for (const item of cart) {
        if (item.product && item.product.price && item.quantity) {
          subtotal += parseFloat(item.product.price) * item.quantity;
        }
      }

      // Validate and apply coupon server-side
      let discountAmount = 0;
      let validCoupon = null;
      
      if (couponCode) {
        try {
          const coupon = await storage.getCouponByCode(couponCode);
          
          if (!coupon || !coupon.isActive) {
            return res.status(400).json({ message: "Invalid or inactive coupon" });
          }

          // Check date validity
          const now = new Date();
          if (coupon.endDate && new Date(coupon.endDate) < now) {
            return res.status(400).json({ message: "Coupon has expired" });
          }

          // Check minimum purchase
          if (coupon.minimumPurchase && subtotal < parseFloat(coupon.minimumPurchase)) {
            return res.status(400).json({ 
              message: `Minimum purchase of $${coupon.minimumPurchase} required for this coupon` 
            });
          }

          // Check usage limits
          if (coupon.maxUsage && coupon.currentUsage >= coupon.maxUsage) {
            return res.status(400).json({ message: "Coupon usage limit reached" });
          }

          // Calculate discount
          if (coupon.discountType === "percentage") {
            discountAmount = subtotal * (parseFloat(coupon.discountValue) / 100);
          } else {
            discountAmount = Math.min(parseFloat(coupon.discountValue), subtotal);
          }
          
          validCoupon = coupon;
          console.log(`Valid coupon ${couponCode} applied: $${discountAmount} discount`);
        } catch (error) {
          console.error("Error validating coupon:", error);
          return res.status(400).json({ message: "Error validating coupon" });
        }
      }

      // Calculate shipping fee
      const shippingFee = shippingMethod === "local_pickup" ? 0 : 5.99;
      
      // Calculate tax (8.75% of subtotal after discount + shipping)
      const taxableAmount = subtotal - discountAmount + shippingFee;
      const taxAmount = taxableAmount * 0.0875;
      
      // Calculate final total
      const total = subtotal - discountAmount + shippingFee + taxAmount;

      console.log(`Creating payment intent - Subtotal: $${subtotal}, Discount: $${discountAmount}, Shipping: $${shippingFee}, Tax: $${taxAmount}, Total: $${total}`);
      
      const paymentIntentParams: any = {
        amount: Math.round(total * 100), // Convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          subtotal: subtotal.toFixed(2),
          shipping_fee: shippingFee.toFixed(2),
          tax_amount: taxAmount.toFixed(2),
          shipping_method: shippingMethod || "standard",
          cart_items: JSON.stringify(cart), // Include cart items for webhook
        }
      };

      // Add coupon information to Stripe metadata for tracking
      if (validCoupon) {
        paymentIntentParams.metadata.coupon_code = validCoupon.code;
        paymentIntentParams.metadata.discount_amount = discountAmount.toFixed(2);
        paymentIntentParams.metadata.discount_type = validCoupon.discountType;
        paymentIntentParams.metadata.discount_value = validCoupon.discountValue;
        
        // Add description to show discount was applied
        paymentIntentParams.description = `Order with coupon ${validCoupon.code} applied ($${discountAmount.toFixed(2)} discount)`;
      }

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
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        taxAmount: taxAmount,
        totalAmount: total,
        discountAmount: discountAmount,
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
      
      // Send email notification for new order
      try {
        const parsedItems = JSON.parse(order.items);
        await sendOrderNotification({
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.email,
          customerPhone: order.phoneNumber,
          total: order.total,
          items: parsedItems.map((item: any) => ({
            name: item.product?.title || item.customBraceletConfiguration?.title || item.customNecklaceConfiguration?.title || 'Unknown Item',
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: {
            street: order.shippingAddress,
            city: order.city,
            state: order.state,
            zipCode: order.zipCode
          },
          shippingMethod: order.shippingMethod,
          paymentMethod: 'Stripe',
          couponCode: order.couponCode || undefined,
          discountAmount: order.discountAmount || undefined
        });
        console.log('📧 Order notification email sent for order:', order.id);
      } catch (emailError) {
        console.error('Failed to send order notification email:', emailError);
        // Don't fail the order creation if email fails
      }
      
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

  // Stripe webhook endpoint to handle successful payments from any source
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'] as string | undefined;
    let event;

    try {
      if (!stripe) {
        return res.status(503).json({ message: "Stripe is not configured" });
      }

      // We need the webhook secret to verify the signature
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      // Get the raw body for signature verification
      const rawBody = JSON.stringify(req.body);
      
      if (webhookSecret && sig) {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(
          rawBody,
          sig,
          webhookSecret
        );
      } else {
        // If no webhook secret, parse the body directly (less secure but works for testing)
        event = req.body;
        console.warn("⚠️ Stripe webhook secret not configured - signature verification skipped");
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log(`💰 Payment successful for payment intent ${paymentIntent.id}`);

        // Check if order already exists to avoid duplicates
        // For now, we'll skip this check since the method doesn't exist yet
        // TODO: Add getOrderByPaymentIntentId to storage interface
        console.log(`Processing payment for intent ${paymentIntent.id}`);

        // Extract metadata and shipping info from the payment intent
        const metadata = paymentIntent.metadata || {};
        const shipping = paymentIntent.shipping;
        
        // Create the order
        const orderData = {
          customerName: shipping?.name || metadata.customer_name || "Customer",
          customerEmail: paymentIntent.receipt_email || metadata.customer_email || "",
          shippingAddress: shipping?.address?.line1 || "",
          city: shipping?.address?.city || "",
          state: shipping?.address?.state || "",
          zipCode: shipping?.address?.postal_code || "",
          items: metadata.cart_items || "[]", // Cart items should be stored in metadata
          totalAmount: (paymentIntent.amount / 100).toFixed(2),
          taxAmount: metadata.tax_amount || "0",
          shippingMethod: metadata.shipping_method || "standard",
          shippingFee: metadata.shipping_fee || "5.99",
          status: "completed",
          stripePaymentIntentId: paymentIntent.id,
          couponCode: metadata.coupon_code || "",
          discountAmount: metadata.discount_amount || "0",
        };

        // Validate required fields
        if (!orderData.customerName || !orderData.totalAmount) {
          console.error("Missing required order data:", orderData);
          return res.status(400).json({ 
            message: "Missing required order information",
            details: "Customer name or total amount is missing"
          });
        }

        const order = await storage.createOrder(orderData as any);
        console.log(`✅ Order created: ${order.id} for payment ${paymentIntent.id}`);
        
        // Send email notification for new order
        try {
          const parsedItems = JSON.parse(order.items);
          await sendOrderNotification({
            orderId: order.id,
            customerName: order.customerName,
            customerEmail: order.email,
            customerPhone: order.phoneNumber,
            total: order.total,
            items: parsedItems.map((item: any) => ({
              name: item.product?.title || item.customBraceletConfiguration?.title || item.customNecklaceConfiguration?.title || 'Unknown Item',
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress: {
              street: order.shippingAddress,
              city: order.city,
              state: order.state,
              zipCode: order.zipCode
            },
            shippingMethod: order.shippingMethod,
            paymentMethod: 'Stripe (via webhook)',
            couponCode: order.couponCode || undefined,
            discountAmount: order.discountAmount || undefined
          });
          console.log('📧 Order notification email sent for order (via webhook):', order.id);
        } catch (emailError) {
          console.error('Failed to send order notification email:', emailError);
          // Don't fail the order creation if email fails
        }
        
        // If a coupon was used, increment its usage count
        if (metadata.coupon_code) {
          try {
            // Update coupon usage count
            const coupon = await storage.getCouponByCode(metadata.coupon_code);
            if (coupon) {
              await storage.updateCoupon(coupon.id, {
                currentUsage: coupon.currentUsage + 1
              });
              console.log(`Incremented usage for coupon: ${metadata.coupon_code}`);
            }
          } catch (couponError) {
            console.error("Failed to increment coupon usage:", couponError);
          }
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Error processing webhook: " + error.message });
    }
  });

  // Admin - Test email notification
  app.post("/api/test-email", requireAdmin, async (req, res) => {
    try {
      const success = await sendTestEmail();
      if (success) {
        res.json({ message: "Test email sent successfully! Check your Gmail inbox." });
      } else {
        res.status(500).json({ message: "Failed to send test email. Check server logs for details." });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error sending test email: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
