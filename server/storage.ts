import { 
  type Product, type InsertProduct, 
  type Order, type InsertOrder,
  type Charm, type InsertCharm,
  type BraceletBead, type InsertBraceletBead,
  type BraceletTemplate, type InsertBraceletTemplate,
  type CustomBraceletConfiguration, type InsertCustomBraceletConfiguration,
  type NecklaceTemplate, type InsertNecklaceTemplate,
  type CustomNecklaceConfiguration, type InsertCustomNecklaceConfiguration,
  type Coupon, type InsertCoupon,
  products, orders, charms, braceletBeads, braceletTemplates, customBraceletConfigurations,
  necklaceTemplates, customNecklaceConfigurations, coupons
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, asc, and, isNull } from "drizzle-orm";

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductInventory(id: string, quantityChange: number): Promise<Product | undefined>;
  
  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updatePaymentStatus(id: string, paymentStatus: string): Promise<Order | undefined>;
  updateShippingLabel(
    id: string,
    trackingNumber: string,
    shippingLabelUrl: string,
    shippingCarrier: string
  ): Promise<Order | undefined>;

  getAllCharms(): Promise<Charm[]>;
  getCharm(id: string): Promise<Charm | undefined>;
  getCharmByName(name: string): Promise<Charm | undefined>;
  createCharm(charm: InsertCharm): Promise<Charm>;
  updateCharmInventory(id: string, quantityChange: number): Promise<Charm | undefined>;
  updateCharmPrice(id: string, price: string): Promise<Charm | undefined>;
  
  getAllBraceletBeads(): Promise<BraceletBead[]>;
  getBraceletBead(id: string): Promise<BraceletBead | undefined>;
  getBeadByName(name: string): Promise<BraceletBead | undefined>;
  getBeadByNameAndSize(name: string, size: string | null): Promise<BraceletBead | undefined>;
  updateBeadInventory(id: string, quantityChange: number): Promise<BraceletBead | undefined>;
  updateBeadPrice(id: string, price: string): Promise<BraceletBead | undefined>;
  
  getAllBraceletTemplates(): Promise<BraceletTemplate[]>;
  getBraceletTemplate(id: string): Promise<BraceletTemplate | undefined>;
  createBraceletTemplate(template: InsertBraceletTemplate): Promise<BraceletTemplate>;
  
  createCustomBraceletConfiguration(config: InsertCustomBraceletConfiguration): Promise<CustomBraceletConfiguration>;
  getCustomBraceletConfiguration(id: string): Promise<CustomBraceletConfiguration | undefined>;
  
  getAllNecklaceTemplates(): Promise<NecklaceTemplate[]>;
  getNecklaceTemplate(id: string): Promise<NecklaceTemplate | undefined>;
  createNecklaceTemplate(template: InsertNecklaceTemplate): Promise<NecklaceTemplate>;
  
  createCustomNecklaceConfiguration(config: InsertCustomNecklaceConfiguration): Promise<CustomNecklaceConfiguration>;
  getCustomNecklaceConfiguration(id: string): Promise<CustomNecklaceConfiguration | undefined>;
  
  getAllCoupons(): Promise<Coupon[]>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;
  incrementCouponUsage(code: string): Promise<Coupon | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private coupons: Map<string, Coupon>;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.coupons = new Map();
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

  async updateProductInventory(id: string, quantityChange: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const newQuantity = Math.max(0, product.stockQuantity + quantityChange);
    const updatedProduct = {
      ...product,
      stockQuantity: newQuantity,
      inStock: newQuantity > 0,
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
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
      taxAmount: insertOrder.taxAmount ?? "0.00",
      shippingMethod: insertOrder.shippingMethod ?? "standard",
      shippingFee: insertOrder.shippingFee ?? "5.99",
      status: insertOrder.status ?? "pending",
      paymentMethod: insertOrder.paymentMethod ?? "stripe",
      paymentStatus: insertOrder.paymentStatus ?? "pending",
      stripePaymentIntentId: insertOrder.stripePaymentIntentId ?? null,
      trackingNumber: null,
      shippingLabelUrl: null,
      shippingCarrier: null,
      couponCode: insertOrder.couponCode ?? null,
      discountAmount: insertOrder.discountAmount ?? "0.00",
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

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, paymentStatus };
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

  async getAllCharms(): Promise<Charm[]> {
    return [];
  }

  async getCharm(id: string): Promise<Charm | undefined> {
    return undefined;
  }

  async getCharmByName(name: string): Promise<Charm | undefined> {
    return undefined;
  }

  async createCharm(charm: InsertCharm): Promise<Charm> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateCharmInventory(id: string, quantityChange: number): Promise<Charm | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateCharmPrice(id: string, price: string): Promise<Charm | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async getAllBraceletBeads(): Promise<BraceletBead[]> {
    return [];
  }

  async getBraceletBead(id: string): Promise<BraceletBead | undefined> {
    return undefined;
  }

  async getBeadByName(name: string): Promise<BraceletBead | undefined> {
    return undefined;
  }

  async getBeadByNameAndSize(name: string, size: string | null): Promise<BraceletBead | undefined> {
    return undefined;
  }

  async updateBeadInventory(id: string, quantityChange: number): Promise<BraceletBead | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateBeadPrice(id: string, price: string): Promise<BraceletBead | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async getAllBraceletTemplates(): Promise<BraceletTemplate[]> {
    return [];
  }

  async getBraceletTemplate(id: string): Promise<BraceletTemplate | undefined> {
    return undefined;
  }

  async createBraceletTemplate(template: InsertBraceletTemplate): Promise<BraceletTemplate> {
    throw new Error("Not implemented in MemStorage");
  }

  async createCustomBraceletConfiguration(config: InsertCustomBraceletConfiguration): Promise<CustomBraceletConfiguration> {
    throw new Error("Not implemented in MemStorage");
  }

  async getCustomBraceletConfiguration(id: string): Promise<CustomBraceletConfiguration | undefined> {
    return undefined;
  }

  async getAllNecklaceTemplates(): Promise<NecklaceTemplate[]> {
    return [];
  }

  async getNecklaceTemplate(id: string): Promise<NecklaceTemplate | undefined> {
    return undefined;
  }

  async createNecklaceTemplate(template: InsertNecklaceTemplate): Promise<NecklaceTemplate> {
    throw new Error("Not implemented in MemStorage");
  }

  async createCustomNecklaceConfiguration(config: InsertCustomNecklaceConfiguration): Promise<CustomNecklaceConfiguration> {
    throw new Error("Not implemented in MemStorage");
  }

  async getCustomNecklaceConfiguration(id: string): Promise<CustomNecklaceConfiguration | undefined> {
    return undefined;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const upperCode = code.toUpperCase();
    return Array.from(this.coupons.values()).find(c => c.code === upperCode);
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const coupon: Coupon = {
      id,
      code: insertCoupon.code.toUpperCase(),
      description: insertCoupon.description ?? null,
      discountType: insertCoupon.discountType,
      discountValue: insertCoupon.discountValue,
      minimumPurchase: insertCoupon.minimumPurchase ?? null,
      maxUsage: insertCoupon.maxUsage ?? null,
      currentUsage: 0,
      startDate: insertCoupon.startDate ?? null,
      endDate: insertCoupon.endDate ?? null,
      isActive: insertCoupon.isActive ?? true,
      createdAt: new Date(),
    };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const coupon = this.coupons.get(id);
    if (!coupon) return undefined;
    
    const updatedCoupon: Coupon = {
      ...coupon,
      ...updates,
      code: updates.code ? updates.code.toUpperCase() : coupon.code,
    };
    this.coupons.set(id, updatedCoupon);
    return updatedCoupon;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.coupons.delete(id);
  }

  async incrementCouponUsage(code: string): Promise<Coupon | undefined> {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) return undefined;
    
    const updatedCoupon: Coupon = {
      ...coupon,
      currentUsage: coupon.currentUsage + 1,
    };
    this.coupons.set(coupon.id, updatedCoupon);
    return updatedCoupon;
  }
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(asc(products.name));
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

  async updateProductInventory(id: string, quantityChange: number): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;

    const newQuantity = Math.max(0, product.stockQuantity + quantityChange);
    const [updatedProduct] = await db
      .update(products)
      .set({
        stockQuantity: newQuantity,
        inStock: newQuantity > 0,
      })
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct || undefined;
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

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ paymentStatus })
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

  async getAllCharms(): Promise<Charm[]> {
    return await db.select().from(charms);
  }

  async getCharm(id: string): Promise<Charm | undefined> {
    const [charm] = await db.select().from(charms).where(eq(charms.id, id));
    return charm || undefined;
  }

  async getCharmByName(name: string): Promise<Charm | undefined> {
    const [charm] = await db.select().from(charms).where(eq(charms.name, name));
    return charm || undefined;
  }

  async createCharm(insertCharm: InsertCharm): Promise<Charm> {
    const [charm] = await db
      .insert(charms)
      .values(insertCharm)
      .returning();
    return charm;
  }

  async updateCharmInventory(id: string, quantityChange: number): Promise<Charm | undefined> {
    const existingCharm = await this.getCharm(id);
    if (!existingCharm) return undefined;

    const newQuantity = Math.max(0, existingCharm.stockQuantity + quantityChange);
    const [updatedCharm] = await db
      .update(charms)
      .set({
        stockQuantity: newQuantity,
        inStock: newQuantity > 0,
      })
      .where(eq(charms.id, id))
      .returning();
    return updatedCharm || undefined;
  }

  async updateCharmPrice(id: string, price: string): Promise<Charm | undefined> {
    const [updatedCharm] = await db
      .update(charms)
      .set({ price })
      .where(eq(charms.id, id))
      .returning();
    return updatedCharm || undefined;
  }

  async getAllBraceletBeads(): Promise<BraceletBead[]> {
    return await db.select().from(braceletBeads);
  }

  async getBraceletBead(id: string): Promise<BraceletBead | undefined> {
    const [bead] = await db.select().from(braceletBeads).where(eq(braceletBeads.id, id));
    return bead || undefined;
  }

  async getBeadByName(name: string): Promise<BraceletBead | undefined> {
    const [bead] = await db.select().from(braceletBeads).where(eq(braceletBeads.name, name));
    return bead || undefined;
  }

  async getBeadByNameAndSize(name: string, size: string | null): Promise<BraceletBead | undefined> {
    if (size) {
      const [bead] = await db.select().from(braceletBeads)
        .where(and(eq(braceletBeads.name, name), eq(braceletBeads.size, size)));
      return bead || undefined;
    } else {
      const [bead] = await db.select().from(braceletBeads)
        .where(and(eq(braceletBeads.name, name), isNull(braceletBeads.size)));
      return bead || undefined;
    }
  }

  async updateBeadInventory(id: string, quantityChange: number): Promise<BraceletBead | undefined> {
    const existingBead = await this.getBraceletBead(id);
    if (!existingBead) return undefined;

    const newQuantity = Math.max(0, existingBead.stockQuantity + quantityChange);
    const [updatedBead] = await db
      .update(braceletBeads)
      .set({
        stockQuantity: newQuantity,
        inStock: newQuantity > 0,
      })
      .where(eq(braceletBeads.id, id))
      .returning();
    return updatedBead || undefined;
  }

  async updateBeadPrice(id: string, price: string): Promise<BraceletBead | undefined> {
    const [updatedBead] = await db
      .update(braceletBeads)
      .set({ price })
      .where(eq(braceletBeads.id, id))
      .returning();
    return updatedBead || undefined;
  }

  async getAllBraceletTemplates(): Promise<BraceletTemplate[]> {
    return await db.select().from(braceletTemplates);
  }

  async getBraceletTemplate(id: string): Promise<BraceletTemplate | undefined> {
    const [template] = await db.select().from(braceletTemplates).where(eq(braceletTemplates.id, id));
    return template || undefined;
  }

  async createBraceletTemplate(insertTemplate: InsertBraceletTemplate): Promise<BraceletTemplate> {
    const [template] = await db
      .insert(braceletTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async createCustomBraceletConfiguration(insertConfig: InsertCustomBraceletConfiguration): Promise<CustomBraceletConfiguration> {
    const [config] = await db
      .insert(customBraceletConfigurations)
      .values(insertConfig)
      .returning();
    return config;
  }

  async getCustomBraceletConfiguration(id: string): Promise<CustomBraceletConfiguration | undefined> {
    const [config] = await db.select().from(customBraceletConfigurations).where(eq(customBraceletConfigurations.id, id));
    return config || undefined;
  }

  async getAllNecklaceTemplates(): Promise<NecklaceTemplate[]> {
    return await db.select().from(necklaceTemplates);
  }

  async getNecklaceTemplate(id: string): Promise<NecklaceTemplate | undefined> {
    const [template] = await db.select().from(necklaceTemplates).where(eq(necklaceTemplates.id, id));
    return template || undefined;
  }

  async createNecklaceTemplate(insertTemplate: InsertNecklaceTemplate): Promise<NecklaceTemplate> {
    const [template] = await db
      .insert(necklaceTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async createCustomNecklaceConfiguration(insertConfig: InsertCustomNecklaceConfiguration): Promise<CustomNecklaceConfiguration> {
    const [config] = await db
      .insert(customNecklaceConfigurations)
      .values(insertConfig)
      .returning();
    return config;
  }

  async getCustomNecklaceConfiguration(id: string): Promise<CustomNecklaceConfiguration | undefined> {
    const [config] = await db.select().from(customNecklaceConfigurations).where(eq(customNecklaceConfigurations.id, id));
    return config || undefined;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon || undefined;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
    return coupon || undefined;
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db
      .insert(coupons)
      .values({
        ...insertCoupon,
        code: insertCoupon.code.toUpperCase(),
      })
      .returning();
    return coupon;
  }

  async updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const updateData = updates.code 
      ? { ...updates, code: updates.code.toUpperCase() }
      : updates;
    
    const [coupon] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, id))
      .returning();
    return coupon || undefined;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async incrementCouponUsage(code: string): Promise<Coupon | undefined> {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) return undefined;
    
    const [updatedCoupon] = await db
      .update(coupons)
      .set({
        currentUsage: coupon.currentUsage + 1,
      })
      .where(eq(coupons.code, code.toUpperCase()))
      .returning();
    
    return updatedCoupon || undefined;
  }
}

export const storage = new DatabaseStorage();
