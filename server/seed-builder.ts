import { db } from "./db";
import { charms, braceletTemplates } from "@shared/schema";
import type { InsertCharm, InsertBraceletTemplate } from "@shared/schema";

const sampleCharms: InsertCharm[] = [
  {
    name: "Heart Charm",
    description: "Beautiful handcrafted heart charm in rose gold",
    price: "8.99",
    imageUrl: "/attached_assets/IMG_3453_1761882788256.jpeg",
    category: "Charms",
    inStock: true,
    stockQuantity: 50,
  },
  {
    name: "Star Charm",
    description: "Delicate star charm with sparkling finish",
    price: "7.99",
    imageUrl: "/attached_assets/IMG_3454_1761882788256.jpeg",
    category: "Charms",
    inStock: true,
    stockQuantity: 50,
  },
  {
    name: "Moon Charm",
    description: "Crescent moon charm in warm gold tone",
    price: "8.99",
    imageUrl: "/attached_assets/IMG_3455_1761882788256.jpeg",
    category: "Charms",
    inStock: true,
    stockQuantity: 50,
  },
  {
    name: "Flower Charm",
    description: "Elegant flower petal charm",
    price: "9.99",
    imageUrl: "/attached_assets/IMG_3456_1761882788256.jpeg",
    category: "Charms",
    inStock: true,
    stockQuantity: 50,
  },
  {
    name: "Pearl Bead",
    description: "Classic pearl bead in cream",
    price: "6.99",
    imageUrl: "/attached_assets/IMG_3457_1761882788256.jpeg",
    category: "Beads",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Rose Gold Bead",
    description: "Smooth rose gold metal bead",
    price: "5.99",
    imageUrl: "/attached_assets/IMG_3458_1761882788256.jpeg",
    category: "Beads",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Crystal Bead",
    description: "Sparkling crystal bead",
    price: "7.99",
    imageUrl: "/attached_assets/IMG_3462_1761882788256.jpeg",
    category: "Beads",
    inStock: true,
    stockQuantity: 80,
  },
  {
    name: "Butterfly Charm",
    description: "Dainty butterfly charm with detailed wings",
    price: "10.99",
    imageUrl: "/attached_assets/IMG_3464_1761882788256.jpeg",
    category: "Charms",
    inStock: true,
    stockQuantity: 40,
  },
];

const sampleTemplates: InsertBraceletTemplate[] = [
  {
    name: "Classic Gold Chain",
    description: "Thin linked chain bracelet in warm gold - perfect for everyday wear",
    basePrice: "29.99",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_3453_1761882788256.jpeg",
    category: "Chain Bracelets",
    inStock: true,
  },
  {
    name: "Rose Gold Chain",
    description: "Mid-weight linked chain in luxurious rose gold",
    basePrice: "34.99",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_3454_1761882788256.jpeg",
    category: "Chain Bracelets",
    inStock: true,
  },
  {
    name: "Beaded Bracelet Base",
    description: "Elastic beaded bracelet base - customize with your favorite beads",
    basePrice: "24.99",
    maxSlots: 15,
    imageUrl: "/attached_assets/IMG_3455_1761882788256.jpeg",
    category: "Beaded Bracelets",
    inStock: true,
  },
];

async function seedBuilder() {
  console.log("Starting bracelet builder seed...");
  
  const existingCharms = await db.select().from(charms);
  const existingTemplates = await db.select().from(braceletTemplates);
  
  if (existingCharms.length > 0) {
    console.log(`Database already has ${existingCharms.length} charms. Skipping charm seed.`);
  } else {
    for (const charm of sampleCharms) {
      await db.insert(charms).values(charm);
    }
    console.log(`Successfully seeded ${sampleCharms.length} charms!`);
  }
  
  if (existingTemplates.length > 0) {
    console.log(`Database already has ${existingTemplates.length} templates. Skipping template seed.`);
  } else {
    for (const template of sampleTemplates) {
      await db.insert(braceletTemplates).values(template);
    }
    console.log(`Successfully seeded ${sampleTemplates.length} bracelet templates!`);
  }
  
  process.exit(0);
}

seedBuilder().catch((error) => {
  console.error("Builder seed failed:", error);
  process.exit(1);
});
