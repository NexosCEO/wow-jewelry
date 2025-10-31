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
