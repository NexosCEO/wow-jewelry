import { db } from "./db";
import { products } from "@shared/schema";
import type { InsertProduct } from "@shared/schema";

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

async function seed() {
  console.log("Starting database seed...");
  
  // Check if products already exist
  const existingProducts = await db.select().from(products);
  
  if (existingProducts.length > 0) {
    console.log(`Database already has ${existingProducts.length} products. Skipping seed.`);
    process.exit(0);
  }
  
  // Insert sample products
  for (const product of sampleProducts) {
    await db.insert(products).values(product);
  }
  
  console.log(`Successfully seeded ${sampleProducts.length} products!`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
