import { db } from "./db";
import { products, charms, braceletTemplates, necklaceTemplates, braceletBeads } from "@shared/schema";
import type { InsertProduct, InsertCharm, InsertBraceletTemplate, InsertNecklaceTemplate, InsertBraceletBead } from "@shared/schema";

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
    imageUrl: "/attached_assets/1- BLUE BUTTERFLY $35_1762438091006.jpeg",
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
    imageUrl: "/attached_assets/1- PLATISE BRACELET $35_1762438027376.jpeg",
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
    imageUrl: "/attached_assets/1- BARTOLOME BRACELET $35_1762437815840.jpeg",
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
    imageUrl: "/attached_assets/1- CRISTOBAL BRACELET $35_1762437916001.jpeg",
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
    description: "Celestial-inspired ring in Size 9. Handcrafted with attention to detail.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/IMG_4101_1762443514086.jpeg",
    imageUrl2: null,
    category: "Rings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Pearl Ring",
    description: "Elegant pearl ring in Size 9. Classic and timeless design.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/IMG_4100_1762443540446.jpeg",
    imageUrl2: null,
    category: "Rings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Aurora Ring",
    description: "Stunning aurora-inspired ring in Size 9. Unique and eye-catching.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1-AURORA RING $25_1762437734980.jpeg",
    imageUrl2: null,
    category: "Rings",
    inStock: true,
    stockQuantity: 10,
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
  {
    name: "Calma Earrings Set",
    description: "Elegant 5-pair earrings set featuring mix of gold hoops, studs and drop earrings. Versatile pieces for every occasion.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1-CALMA EARRINGS SET $25_1762443268655.JPG",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Eliana Necklace",
    description: "Stunning gold necklace with delicate crystal accents. A timeless statement piece.",
    price: "45.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1-ELIANA NECKLACE $45_1762443295223.jpg",
    imageUrl2: null,
    category: "Necklaces",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Zafira Set",
    description: "Complete jewelry set with necklace and earrings featuring elegant blue stone accents.",
    price: "40.00",
    regularPrice: null,
    imageUrl: "/attached_assets/2-ZAFIRA SET $40_1762443316029.JPG",
    imageUrl2: null,
    category: "Sets",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Eliana Earrings",
    description: "Delicate gold drop earrings with crystal detailing. Perfect for elegant occasions.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/2-ELIANA EARRINGS $25_1762443337132.JPG",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Classy Earrings Set",
    description: "Elegant 5-pair earring set with pearls, gold balls, silver balls, and crystal studs in gold and silver.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1-CLASSY EARRINGS SET $25_1762443362212.JPG",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Sara Earrings",
    description: "Beautiful gold drop earrings with oval moonstone or mother-of-pearl stones.",
    price: "25.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1-SARA EARRINGS $25_1762443395289.JPG",
    imageUrl2: null,
    category: "Earrings",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Platinum Crystal Earrings",
    description: "Stunning silver hoop earrings adorned with brilliant crystal accents.",
    price: "19.00",
    regularPrice: null,
    imageUrl: "/attached_assets/1-PLATINIUM CRYSTAL EARRINGS $19_1762443424807.JPG",
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
    price: "2.00",
    imageUrl: "/attached_assets/2- CIRCONIA REDONDA $2_1762444116577.JPG",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Mini Cruise",
    description: "Tiny cross charm with beautiful detailing. A symbol of faith and style.",
    price: "8.00",
    imageUrl: "/attached_assets/1- MINI CRUISE $8 (1)_1762444012082.JPG",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Infinitive",
    description: "Infinity symbol charm representing eternal love and friendship.",
    price: "12.00",
    imageUrl: "/attached_assets/2- INFINITIVE $12_1762444163756.JPG",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Mini Heart",
    description: "Delicate heart charm with crystal center. Perfect symbol of love.",
    price: "5.00",
    imageUrl: "/attached_assets/1- MINI HEART $5_1762444139545.JPG",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Black Clover",
    description: "Elegant four-leaf clover charm with black enamel detail.",
    price: "10.00",
    imageUrl: "/attached_assets/2- BLACK CLOVER $10_1762444190491.JPG",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "God Love",
    description: "Heart with cross charm symbolizing faith and love.",
    price: "8.00",
    imageUrl: "/attached_assets/1- GOD LOVE $8_1762444233131.JPG",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Lottus",
    description: "Beautiful lotus flower charm with crystal center detail.",
    price: "12.00",
    imageUrl: "/attached_assets/1- LOTTUS $12_1762444254942.JPG",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
  {
    name: "Cantuntillo Set",
    description: "Set of 3 elegant gold tube spacer beads for bracelet customization.",
    price: "10.00",
    imageUrl: "/attached_assets/2- CANTUNTILLO SET $10_1762444287698.JPG",
    category: "Charms",
    inStock: true,
    stockQuantity: 10,
  },
];

const realBraceletTemplates: InsertBraceletTemplate[] = [
  {
    name: "Gold String",
    description: "Elegant gold string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_4246_1762537289193.JPG",
    category: "String",
    color: "Gold",
    inStock: true,
  },
  {
    name: "Silver String",
    description: "Sleek silver string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_4247_1762537346600.JPG",
    category: "String",
    color: "Silver",
    inStock: true,
  },
  {
    name: "Red String",
    description: "Bold red string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_4243_1762537237560.JPG",
    category: "String",
    color: "Red",
    inStock: true,
  },
  {
    name: "Black String",
    description: "Classic black string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_4244_1762537181225.JPG",
    category: "String",
    color: "Black",
    inStock: true,
  },
  {
    name: "Blue String",
    description: "Stunning blue string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_4249_1762537321510.JPG",
    category: "String",
    color: "Blue",
    inStock: true,
  },
  {
    name: "Green String",
    description: "Beautiful green string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_4245_1762537264662.JPG",
    category: "String",
    color: "Green",
    inStock: true,
  },
  {
    name: "Pink String",
    description: "Lovely pink string base for your custom bracelet.",
    basePrice: "2.00",
    maxSlots: 11,
    imageUrl: "/attached_assets/IMG_4242_1762537372903.JPG",
    category: "String",
    color: "Pink",
    inStock: true,
  },
];

const realBraceletBeads: InsertBraceletBead[] = [
  {
    name: "Gold Diamantados Bead",
    description: "Luxurious textured gold bead with intricate diamantados pattern.",
    price: "5.00",
    imageUrl: "/attached_assets/6- DIAMANTADOS STYLE size 6mm  price $5_1762442769266.JPG",
    color: "Gold",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Black Basic Neopreno Bead",
    description: "Sleek black neopreno bead for a bold, modern look.",
    price: "1.00",
    imageUrl: "/attached_assets/200-BLACK BASIC NEOPRENO  6MM price $1_1762442619984.JPG",
    color: "Black",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Black Neopreno with Gold Ring",
    description: "Premium black neopreno bead accented with elegant gold band.",
    price: "2.00",
    imageUrl: "/attached_assets/50-BLACK NEOP. WITH RING 6MM price $2_1762442970690.JPG",
    color: "Black",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Red Basic Neopreno Bead",
    description: "Vibrant red neopreno bead to add a pop of color.",
    price: "1.00",
    imageUrl: "/attached_assets/200-RED BASIC NEOPRENO  6MM price $1_1762442697351.JPG",
    color: "Red",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Red Neopreno with Gold Ring",
    description: "Eye-catching red neopreno bead with luxurious gold band accent.",
    price: "2.00",
    imageUrl: "/attached_assets/50-RED NEOP. WITH RING 6MM price $2_1762442643824.JPG",
    color: "Red",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Italian Style Gold Bead",
    description: "Elegant Italian-style gold bead with distinctive ridged design.",
    price: "4.50",
    imageUrl: "/attached_assets/50- ITALIAN STYLE  size 5mm  price $4,50_1762443029088.JPG",
    color: "Gold",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Basic Gold Bead",
    description: "Classic gold bead available in multiple sizes for custom bracelet creation.",
    price: "1.00",
    imageUrl: "/attached_assets/50-GOLD  BASIC STYLE 6mm 5mm and 4mm_1764423795080.JPG",
    color: "Gold",
    inStock: true,
    stockQuantity: 100,
  },
  {
    name: "Basic Silver Bead",
    description: "Classic silver bead available in multiple sizes for custom bracelet creation.",
    price: "1.50",
    imageUrl: "/attached_assets/50-SILVER  BASIC STYLE 5mm and 4mm_1764438866655.JPG",
    color: "Silver",
    inStock: true,
    stockQuantity: 100,
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
  const existingBraceletBeads = await db.select().from(braceletBeads);
  
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
  
  if (existingBraceletBeads.length > 0) {
    console.log("Clearing existing bracelet beads...");
    await db.delete(braceletBeads);
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
  
  // Insert bracelet beads
  console.log(`Inserting ${realBraceletBeads.length} bracelet beads...`);
  for (const bead of realBraceletBeads) {
    await db.insert(braceletBeads).values(bead);
  }
  
  console.log("Database seed completed successfully!");
  console.log(`- ${realProducts.length} products`);
  console.log(`- ${realCharms.length} charms`);
  console.log(`- ${realBraceletTemplates.length} bracelet templates`);
  console.log(`- ${realNecklaceTemplates.length} necklace templates`);
  console.log(`- ${realBraceletBeads.length} bracelet beads`);
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
