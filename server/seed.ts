import { db } from "./db";
import { products, charms, braceletTemplates, necklaceTemplates } from "@shared/schema";
import type { InsertProduct, InsertCharm, InsertBraceletTemplate, InsertNecklaceTemplate } from "@shared/schema";

const realProducts: InsertProduct[] = [
  {
    name: "Blue Love Set",
    description: "Elegant set featuring stunning blue accents. Perfect for adding a touch of sophistication to any outfit.",
    price: "35.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1- BLUE LOVE SET price_ $35_1762106774014.jpg",
    imageUrl2: null,
    category: "Sets",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Luminous Earrings Set",
    description: "Radiant earrings that catch the light beautifully. A must-have accessory for any jewelry collection.",
    price: "30.00",
    regularPrice: null,
    imageUrl: "/attached_assets/2- LUMINOUS EARRINGS SET price $30_1762106811997.jpg",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Isabellina Necklace",
    description: "Exquisite necklace with intricate detailing. The perfect statement piece for special occasions.",
    price: "40.00",
    regularPrice: null,
    imageUrl: "/attached_assets/3- ISABELLINA NECKLACE  price_ $40_1762106845935.jpg",
    imageUrl2: null,
    category: "Necklaces",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Blue Butterfly Earrings Set",
    description: "Delicate butterfly-inspired earrings in beautiful blue tones. Add a whimsical touch to your style.",
    price: "35.00",
    regularPrice: null,
    imageUrl: "/attached_assets/4- BLUE BUTTERFLY EARRINGS SET  price_ $35_1762106884999.jpg",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Clear Crystal Set",
    description: "Sparkling clear crystal set that radiates elegance and brilliance. Perfect for everyday glamour.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/5-CLEAR CRYSTAL SET  price_ $25_1762106914263.jpg",
    imageUrl2: null,
    category: "Sets",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Platise Bracelet",
    description: "Handcrafted bracelet with refined details. A timeless addition to your jewelry collection.",
    price: "35.00",
    regularPrice: null,
    imageUrl: "/attached_assets/6- PLATISE BRACELET price_ $35_1762106938439.jpg",
    imageUrl2: null,
    category: "Bracelets",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Bartolome Bracelet",
    description: "Sophisticated bracelet combining style and craftsmanship. Designed to make a lasting impression.",
    price: "35.00",
    regularPrice: null,
    imageUrl: "/attached_assets/8- BARTOLOME BRACELET  price_ $35_1762107001775.jpg",
    imageUrl2: null,
    category: "Bracelets",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Cristobal Bracelet",
    description: "Beautifully crafted bracelet featuring unique design elements. An eye-catching accessory.",
    price: "35.00",
    regularPrice: null,
    imageUrl: "/attached_assets/9- CRISTOBAL BRACELET  price_ $35_1762107031487.jpg",
    imageUrl2: null,
    category: "Bracelets",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Black Clover",
    description: "Distinctive black clover design bracelet. Bold and elegant for those who love unique pieces.",
    price: "10.00",
    regularPrice: null,
    imageUrl: "/attached_assets/12- BLACK CLOVER  price_ $10_1762107105847.jpg",
    imageUrl2: null,
    category: "Bracelets",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Astral Ring",
    description: "Celestial-inspired ring in Size 9. Pricing coming soon - contact us for details.",
    price: "0.00",
    regularPrice: null,
    imageUrl: "/attached_assets/10- ASTRAL RING_ size_ 9_1762107061335.jpg",
    imageUrl2: null,
    category: "Rings",
    inStock: false,
    stockQuantity: 0,
  },
  {
    name: "Pearl Ring",
    description: "Elegant pearl ring in Size 9. Pricing coming soon - contact us for details.",
    price: "0.00",
    regularPrice: null,
    imageUrl: "/attached_assets/11- PEARL RING  size_ 9_1762107083263.jpg",
    imageUrl2: null,
    category: "Rings",
    inStock: false,
    stockQuantity: 0,
  },
  {
    name: "Aurora Ring",
    description: "Stunning aurora-inspired ring in Size 9. Pricing coming soon - contact us for details.",
    price: "0.00",
    regularPrice: null,
    imageUrl: "/attached_assets/27- AURORA RING size_ 9_1762108390086.jpg",
    imageUrl2: null,
    category: "Rings",
    inStock: false,
    stockQuantity: 0,
  },
];

const realCharms: InsertCharm[] = [
  {
    name: "Mini San Benito",
    description: "Delicate charm with spiritual significance. Perfect for personalized jewelry.",
    price: "5.00",
    imageUrl: "/attached_assets/13- MINI SAN BENITO  price_ $5_1762107144071.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Circonia Redonda",
    description: "Round crystal charm that adds sparkle to any bracelet or necklace.",
    price: "7.00",
    imageUrl: "/attached_assets/14- CIRCONIA REDONDA  price_ $7_1762107173527.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Mini Cruise",
    description: "Tiny cross charm with beautiful detailing. A symbol of faith and style.",
    price: "8.00",
    imageUrl: "/attached_assets/15- MINI CRUISE  price_ $8_1762107204247.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Infinitive",
    description: "Infinity symbol charm representing eternal love and friendship.",
    price: "10.00",
    imageUrl: "/attached_assets/16- INFINITIVE price_ $10_1762107228935.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Dog Love",
    description: "Adorable dog-themed charm for pet lovers. Show your love for furry friends.",
    price: "5.00",
    imageUrl: "/attached_assets/17- DOG LOVE  price_ $5_1762107255751.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
];

const realBraceletTemplates: InsertBraceletTemplate[] = [
  {
    name: "Basic Style 4mm",
    description: "Classic gold bead base for your custom bracelet. Size: 4mm",
    basePrice: "3.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/18- BASIC STYLE  size_ 4mm  price_$3_1762107292407.jpg",
    category: "Beads",
    inStock: true,
  },
  {
    name: "Italian Style 5mm",
    description: "Premium Italian-style gold bead base. Size: 5mm",
    basePrice: "4.50",
    maxSlots: 11,
    imageUrl: "/attached_assets/50- ITALIAN STYLE  size_ 5mm  price $4,50_1762109346569.jpg",
    category: "Beads",
    inStock: true,
  },
  {
    name: "Basic Style 5mm",
    description: "Classic gold bead base for your custom bracelet. Size: 5mm",
    basePrice: "4.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/50- BASIC STYLE  size_ 5mm  price_$4_1762109372136.jpg",
    category: "Beads",
    inStock: true,
  },
];

const realNecklaceTemplates: InsertNecklaceTemplate[] = [
  {
    name: "Gold String",
    description: "Elegant gold string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/20- NECKLACE GOLD COLOR  price_ $2_1762107344055.jpg",
    color: "Gold",
    inStock: true,
  },
  {
    name: "Green String",
    description: "Beautiful green string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/22- NECKLACE GREEN COLOR  price_ $2_1762107406047.jpg",
    color: "Green",
    inStock: true,
  },
  {
    name: "Blue String",
    description: "Stunning blue string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/24- NECKLACE BLUE COLOR  price_ $2_1762107471167.jpg",
    color: "Blue",
    inStock: true,
  },
  {
    name: "Pink String",
    description: "Lovely pink string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/25- NECKLACE PINK COLOR  price_ $2_1762107502687.jpg",
    color: "Pink",
    inStock: true,
  },
  {
    name: "Silver String",
    description: "Sleek silver string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/26- NECKLACE SILVER COLOR  price_ $2_1762107531599.jpg",
    color: "Silver",
    inStock: true,
  },
];

async function seed() {
  console.log("Starting database seed with real product data...");
  
  // Check if products already exist
  const existingProducts = await db.select().from(products);
  const existingCharms = await db.select().from(charms);
  const existingBraceletTemplates = await db.select().from(braceletTemplates);
  const existingNecklaceTemplates = await db.select().from(necklaceTemplates);
  
  // Clear existing data to reseed with real products
  if (existingProducts.length > 0) {
    console.log("Clearing existing products...");
    await db.delete(products);
  }
  
  if (existingCharms.length > 0) {
    console.log("Clearing existing charms...");
    await db.delete(charms);
  }
  
  if (existingBraceletTemplates.length > 0) {
    console.log("Clearing existing bracelet templates...");
    await db.delete(braceletTemplates);
  }
  
  if (existingNecklaceTemplates.length > 0) {
    console.log("Clearing existing necklace templates...");
    await db.delete(necklaceTemplates);
  }
  
  // Insert real products
  console.log(`Inserting ${realProducts.length} products...`);
  for (const product of realProducts) {
    await db.insert(products).values(product);
  }
  
  // Insert real charms
  console.log(`Inserting ${realCharms.length} charms...`);
  for (const charm of realCharms) {
    await db.insert(charms).values(charm);
  }
  
  // Insert bracelet templates
  console.log(`Inserting ${realBraceletTemplates.length} bracelet templates...`);
  for (const template of realBraceletTemplates) {
    await db.insert(braceletTemplates).values(template);
  }
  
  // Insert necklace templates
  console.log(`Inserting ${realNecklaceTemplates.length} necklace templates...`);
  for (const template of realNecklaceTemplates) {
    await db.insert(necklaceTemplates).values(template);
  }
  
  console.log("Database seed completed successfully!");
  console.log(`- ${realProducts.length} products`);
  console.log(`- ${realCharms.length} charms`);
  console.log(`- ${realBraceletTemplates.length} bracelet templates`);
  console.log(`- ${realNecklaceTemplates.length} necklace templates`);
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
