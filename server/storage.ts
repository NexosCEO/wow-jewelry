import { type Product, type InsertProduct, type Order, type InsertOrder, products, orders } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updateShippingLabel(
    id: string,
    trackingNumber: string,
    shippingLabelUrl: string,
    shippingCarrier: string
  ): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.initializeProducts();
  }

  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Product 1",
        description: "Beautiful handmade jewelry piece. Details coming soon.",
        price: "49.99",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3453_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Product 2",
        description: "Beautiful handmade jewelry piece. Details coming soon.",
        price: "49.99",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3454_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Product 3",
        description: "Beautiful handmade jewelry piece. Details coming soon.",
        price: "49.99",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3455_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Product 4",
        description: "Beautiful handmade jewelry piece. Details coming soon.",
        price: "49.99",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3456_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Product 5",
        description: "Beautiful handmade jewelry piece. Details coming soon.",
        price: "49.99",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3457_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Product 6",
        description: "Beautiful handmade jewelry piece. Details coming soon.",
        price: "49.99",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3458_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Product 7",
        description: "Beautiful handmade jewelry piece. Details coming soon.",
        price: "49.99",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3462_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Product 8",
        description: "Beautiful handmade jewelry piece. Details coming soon.",
        price: "49.99",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3464_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Test Item - $1",
        description: "Test product for payment and shipping verification. Purchase this to test the complete checkout, payment, and admin shipping label process.",
        price: "1.00",
        regularPrice: null,
        imageUrl: "/attached_assets/IMG_3453_1761882788256.jpeg",
        imageUrl2: null,
        category: "Jewelry",
        inStock: true,
        stockQuantity: 999,
      },
    ];

    sampleProducts.forEach((insertProduct) => {
      const id = randomUUID();
      const product: Product = {
        id,
        name: insertProduct.name,
        description: insertProduct.description,
        price: insertProduct.price,
        regularPrice: insertProduct.regularPrice ?? null,
        imageUrl: insertProduct.imageUrl,
        imageUrl2: insertProduct.imageUrl2 ?? null,
        category: insertProduct.category,
        inStock: insertProduct.inStock ?? true,
        stockQuantity: insertProduct.stockQuantity ?? 0,
      };
      this.products.set(id, product);
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      id,
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      regularPrice: insertProduct.regularPrice ?? null,
      imageUrl: insertProduct.imageUrl,
      imageUrl2: insertProduct.imageUrl2 ?? null,
      category: insertProduct.category,
      inStock: insertProduct.inStock ?? true,
      stockQuantity: insertProduct.stockQuantity ?? 0,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = { 
      ...product,
      ...updates,
      regularPrice: updates.regularPrice !== undefined ? updates.regularPrice : product.regularPrice,
      imageUrl2: updates.imageUrl2 !== undefined ? updates.imageUrl2 : product.imageUrl2,
      inStock: updates.inStock !== undefined ? updates.inStock : product.inStock,
      stockQuantity: updates.stockQuantity !== undefined ? updates.stockQuantity : product.stockQuantity,
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      id,
      customerName: insertOrder.customerName,
      customerEmail: insertOrder.customerEmail,
      shippingAddress: insertOrder.shippingAddress,
      city: insertOrder.city,
      state: insertOrder.state,
      zipCode: insertOrder.zipCode,
      items: insertOrder.items,
      totalAmount: insertOrder.totalAmount,
      status: insertOrder.status ?? "pending",
      stripePaymentIntentId: insertOrder.stripePaymentIntentId ?? null,
      trackingNumber: null,
      shippingLabelUrl: null,
      shippingCarrier: null,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateShippingLabel(
    id: string,
    trackingNumber: string,
    shippingLabelUrl: string,
    shippingCarrier: string
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      trackingNumber,
      shippingLabelUrl,
      shippingCarrier,
      status: "shipped",
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateShippingLabel(
    id: string,
    trackingNumber: string,
    shippingLabelUrl: string,
    shippingCarrier: string
  ): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({
        trackingNumber,
        shippingLabelUrl,
        shippingCarrier,
        status: "shipped",
      })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }
}

export const storage = new DatabaseStorage();
