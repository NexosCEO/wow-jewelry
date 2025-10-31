import { type Product, type InsertProduct, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

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
        name: "Golden Elegance Necklace",
        description: "A stunning gold pendant necklace with delicate chain. Perfect for everyday wear or special occasions. Handcrafted with attention to every detail.",
        price: "89.99",
        regularPrice: "120.00",
        imageUrl: "/attached_assets/generated_images/Gold_pendant_necklace_fd312f99.png",
        imageUrl2: null,
        category: "Necklaces",
        inStock: true,
        stockQuantity: 8,
      },
      {
        name: "Classic Silver Hoops",
        description: "Timeless silver hoop earrings that complement any outfit. Lightweight and comfortable for all-day wear.",
        price: "45.99",
        regularPrice: null,
        imageUrl: "/attached_assets/generated_images/Silver_hoop_earrings_3a072cba.png",
        imageUrl2: null,
        category: "Earrings",
        inStock: true,
        stockQuantity: 12,
      },
      {
        name: "Gemstone Bliss Bracelet",
        description: "Colorful beaded bracelet featuring natural gemstones. Each bead is carefully selected and hand-strung to create a unique piece.",
        price: "65.00",
        regularPrice: "85.00",
        imageUrl: "/attached_assets/generated_images/Beaded_gemstone_bracelet_d33a8fd5.png",
        imageUrl2: null,
        category: "Bracelets",
        inStock: true,
        stockQuantity: 5,
      },
      {
        name: "Rose Dream Ring",
        description: "Elegant rose gold ring with a delicate diamond accent. A perfect symbol of love and commitment.",
        price: "129.99",
        regularPrice: "160.00",
        imageUrl: "/attached_assets/generated_images/Rose_gold_diamond_ring_95d3577f.png",
        imageUrl2: null,
        category: "Rings",
        inStock: true,
        stockQuantity: 3,
      },
      {
        name: "Pearl Drop Earrings",
        description: "Classic pearl drop earrings with sterling silver hooks. Sophisticated and elegant for any formal occasion.",
        price: "75.00",
        regularPrice: null,
        imageUrl: "/attached_assets/generated_images/Pearl_drop_earrings_46022f39.png",
        imageUrl2: null,
        category: "Earrings",
        inStock: true,
        stockQuantity: 10,
      },
      {
        name: "Heart Charm Bracelet",
        description: "Delicate gold chain bracelet with a sweet heart charm. A thoughtful gift for someone special.",
        price: "55.00",
        regularPrice: null,
        imageUrl: "/attached_assets/generated_images/Gold_heart_charm_bracelet_1c5f0d25.png",
        imageUrl2: null,
        category: "Bracelets",
        inStock: true,
        stockQuantity: 7,
      },
    ];

    sampleProducts.forEach((product) => {
      const id = randomUUID();
      this.products.set(id, { ...product, id });
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
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
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
      ...insertOrder,
      id,
      createdAt: new Date().toISOString(),
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
}

export const storage = new MemStorage();
