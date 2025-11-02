import { db } from "./db";
import { products, charms, braceletTemplates, necklaceTemplates } from "@shared/schema";
import type { InsertProduct, InsertCharm, InsertBraceletTemplate, InsertNecklaceTemplate } from "@shared/schema";

const realProducts: InsertProduct[] = [
  {
    name: "Blue Love Set",
    description: "Elegant set featuring stunning blue accents. Perfect for adding a touch of sophistication to any outfit.",
    price: "35.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1-BLUE LOVE SET $35_1762108080228.jpg",
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
    imageUrl: "/attached_assets/2-LUMINOUS EARRINGS SET $30_1762108234509.jpg",
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
    imageUrl: "/attached_assets/1-ISABELLINA NECKLACE $40_1762108275944.jpg",
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
    imageUrl: "/attached_assets/1-BLUE BUTTERFLY EARRINGS SET $35_1762108332901.jpg",
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
    imageUrl: "/attached_assets/1-CLEAR CRYSTAL SET $25_1762108426576.jpg",
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
    imageUrl: "/attached_assets/1-PLATISE BRACELET $35 _1762108451901.jpg",
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
    imageUrl: "/attached_assets/1-BARTOLOME BRACELET $35 _1762108479918.jpg",
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
    imageUrl: "/attached_assets/1-CRISTOBAL BRACELET $35_1762108505912.jpg",
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
    imageUrl: "/attached_assets/2-BLACK CLOVER $10_1762108708434.webp",
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
    imageUrl: "/attached_assets/1-ASTRAL RING- SIZE 9_1762108544578.jpg",
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
    imageUrl: "/attached_assets/1-PEARL RING SIZE 9_1762108570535.jpg",
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
    imageUrl: "/attached_assets/1-AURORA RING SIZE 9_1762108657279.jpg",
    imageUrl2: null,
    category: "Rings",
    inStock: false,
    stockQuantity: 0,
  },
  {
    name: "Festiva Cuff Earrings",
    description: "Modern cuff earrings with a festive twist. Stylish and comfortable for everyday wear.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/2-FESTIVA CUFF EARRINGS $25_1762109581793.jpg",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Rose Sky Set",
    description: "Enchanting rose-toned necklace and earrings set. Delicate pink crystals create a dreamy, romantic look.",
    price: "40.00",
    regularPrice: null,
    imageUrl: "/attached_assets/2-ROSE SKY SET $40_1762109609309.jpg",
    imageUrl2: null,
    category: "Sets",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Lilian Rose Earrings Set",
    description: "Versatile earrings set featuring four stunning pairs. Gold hoops, teardrops, and crystal studs in pink and clear.",
    price: "30.00",
    regularPrice: null,
    imageUrl: "/attached_assets/2-LILIAN ROSE EARRINGS SET $30_1762109637389.jpg",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Vital Crystal Earrings",
    description: "Elegant drop earrings with crystals and pearl accents. Perfect for adding sophistication to any outfit.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1-VITAL CRYSTAL EARRINGS $25_1762109660243.jpg",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
];

const realCharms: InsertCharm[] = [
  {
    name: "Mini San Benito",
    description: "Delicate charm with spiritual significance. Perfect for personalized jewelry.",
    price: "5.00",
    imageUrl: "/attached_assets/1-MINI SAN BENITO $5_1762108753249.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Circonia Redonda",
    description: "Round crystal charm that adds sparkle to any bracelet or necklace.",
    price: "7.00",
    imageUrl: "/attached_assets/1- CIRCONIA REDONDA $7_1762108788250.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Mini Cruise",
    description: "Tiny cross charm with beautiful detailing. A symbol of faith and style.",
    price: "8.00",
    imageUrl: "/attached_assets/1- MINI CRUISE $8_1762109177810.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Infinitive",
    description: "Infinity symbol charm representing eternal love and friendship.",
    price: "10.00",
    imageUrl: "/attached_assets/1- INFINITIVE $10_1762109203250.jpg",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Dog Love",
    description: "Adorable dog-themed charm for pet lovers. Show your love for furry friends.",
    price: "5.00",
    imageUrl: "/attached_assets/1- DOG LOVE $5_1762109248253.jpg",
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
    imageUrl: "/attached_assets/50- BASIC STYLE  size_ 4mm  price $3_1762109293239.jpg",
    category: "Beads",
    color: "Gold",
    inStock: true,
  },
  {
    name: "Italian Style 5mm",
    description: "Premium Italian-style gold bead base. Size: 5mm",
    basePrice: "4.50",
    maxSlots: 11,
    imageUrl: "/attached_assets/50- ITALIAN STYLE  size_ 5mm  price $4,50_1762109346569.jpg",
    category: "Beads",
    color: "Gold",
    inStock: true,
  },
  {
    name: "Basic Style 5mm",
    description: "Classic gold bead base for your custom bracelet. Size: 5mm",
    basePrice: "4.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/50- BASIC STYLE  size_ 5mm  price_$4_1762109372136.jpg",
    category: "Beads",
    color: "Gold",
    inStock: true,
  },
  {
    name: "Diamantados Style 6mm",
    description: "Stunning faceted gold bead base with diamond-cut design. Size: 6mm",
    basePrice: "5.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/6- DIAMANTADOS STYLE size_ 6mm  price $5_1762109500427.jpg",
    category: "Beads",
    color: "Gold",
    inStock: true,
  },
  {
    name: "Silver Style 4mm",
    description: "Elegant silver bead base for your custom bracelet. Size: 4mm",
    basePrice: "3.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/50- SILVER STYLE  size_ 4mm  price $3_1762109545347.jpg",
    category: "Beads",
    color: "Silver",
    inStock: true,
  },
  {
    name: "Red Neopreno with Ring 6mm",
    description: "Bold red neoprene bead base with gold ring accent. Size: 6mm",
    basePrice: "1.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/50- RED NEOPRENO WITH RING size 6mm price 1_1762109687279.jpg",
    category: "Beads",
    color: "Red",
    inStock: true,
  },
  {
    name: "Black Neopreno with Ring 6mm",
    description: "Sleek black neoprene bead base with gold ring accent. Size: 6mm",
    basePrice: "1.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/50- BLACK NEOPRENO WITH RING  size $6mm  price_ $1 _1762109712971.jpg",
    category: "Beads",
    color: "Black",
    inStock: true,
  },
  {
    name: "Black Basic Neopreno 6mm",
    description: "Classic black neoprene bead base. Simple and elegant. Size: 6mm",
    basePrice: "1.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/200- BLACK BASIC NEOPRENO size 6mm price 1_1762109739137.jpg",
    category: "Beads",
    color: "Black",
    inStock: true,
  },
  {
    name: "Red Basic Neopreno 6mm",
    description: "Classic red neoprene bead base. Bold and vibrant. Size: 6mm",
    basePrice: "1.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/200- RED BASIC NEOPRENO size 6mm price $1_1762109762799.jpg",
    category: "Beads",
    color: "Red",
    inStock: true,
  },
  {
    name: "Blue String",
    description: "Stunning blue string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/BLUE_1762109156908.jpg",
    category: "String",
    color: "Blue",
    inStock: true,
  },
  {
    name: "Green String",
    description: "Beautiful green string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/GREEN_1762109124128.jpg",
    category: "String",
    color: "Green",
    inStock: true,
  },
  {
    name: "Pink String",
    description: "Lovely pink string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/PINK_1762109221035.jpg",
    category: "String",
    color: "Pink",
    inStock: true,
  },
];

const realNecklaceTemplates: InsertNecklaceTemplate[] = [
  {
    name: "Gold String",
    description: "Elegant gold string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/GOLD_1762108975508.jpeg",
    color: "Gold",
    inStock: true,
  },
  {
    name: "Green String",
    description: "Beautiful green string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/GREEN_1762109124128.jpg",
    color: "Green",
    inStock: true,
  },
  {
    name: "Blue String",
    description: "Stunning blue string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/BLUE_1762109156908.jpg",
    color: "Blue",
    inStock: true,
  },
  {
    name: "Pink String",
    description: "Lovely pink string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/PINK_1762109221035.jpg",
    color: "Pink",
    inStock: true,
  },
  {
    name: "Silver String",
    description: "Sleek silver string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/SILVER_1762109314679.webp",
    color: "Silver",
    inStock: true,
  },
  {
    name: "Red String",
    description: "Bold red string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/RED AND BLACK _1762109524467.jpg",
    color: "Red",
    inStock: true,
  },
  {
    name: "Black String",
    description: "Classic black string base for your custom necklace.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/RED AND BLACK _1762109524467.jpg",
    color: "Black",
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
