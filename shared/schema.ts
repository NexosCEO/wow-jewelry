import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  regularPrice: decimal("regular_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull(),
  imageUrl2: text("image_url_2"),
  category: text("category").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  stockQuantity: integer("stock_quantity").notNull().default(0),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  items: text("items").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  shippingMethod: text("shipping_method").notNull().default("standard"),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).notNull().default("5.99"),
  status: text("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  trackingNumber: text("tracking_number"),
  shippingLabelUrl: text("shipping_label_url"),
  shippingCarrier: text("shipping_carrier"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const charms = pgTable("charms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  stockQuantity: integer("stock_quantity").notNull().default(0),
});

export const braceletTemplates = pgTable("bracelet_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  maxSlots: integer("max_slots").notNull().default(11),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  color: text("color").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
});

export const customBraceletConfigurations = pgTable("custom_bracelet_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  selectedCharms: text("selected_charms").notNull(),
  selectedBeads: text("selected_beads").notNull().default("[]"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const necklaceTemplates = pgTable("necklace_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  maxSlots: integer("max_slots").notNull().default(11),
  imageUrl: text("image_url").notNull(),
  color: text("color").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
});

export const customNecklaceConfigurations = pgTable("custom_necklace_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  selectedCharms: text("selected_charms").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const braceletBeads = pgTable("bracelet_beads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  color: text("color").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  stockQuantity: integer("stock_quantity").notNull().default(0),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertCharmSchema = createInsertSchema(charms).omit({
  id: true,
});

export const insertBraceletTemplateSchema = createInsertSchema(braceletTemplates).omit({
  id: true,
});

export const insertCustomBraceletConfigurationSchema = createInsertSchema(customBraceletConfigurations).omit({
  id: true,
  createdAt: true,
});

export const insertNecklaceTemplateSchema = createInsertSchema(necklaceTemplates).omit({
  id: true,
});

export const insertCustomNecklaceConfigurationSchema = createInsertSchema(customNecklaceConfigurations).omit({
  id: true,
  createdAt: true,
});

export const insertBraceletBeadSchema = createInsertSchema(braceletBeads).omit({
  id: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Charm = typeof charms.$inferSelect;
export type InsertCharm = z.infer<typeof insertCharmSchema>;
export type BraceletTemplate = typeof braceletTemplates.$inferSelect;
export type InsertBraceletTemplate = z.infer<typeof insertBraceletTemplateSchema>;
export type CustomBraceletConfiguration = typeof customBraceletConfigurations.$inferSelect;
export type InsertCustomBraceletConfiguration = z.infer<typeof insertCustomBraceletConfigurationSchema>;
export type NecklaceTemplate = typeof necklaceTemplates.$inferSelect;
export type InsertNecklaceTemplate = z.infer<typeof insertNecklaceTemplateSchema>;
export type CustomNecklaceConfiguration = typeof customNecklaceConfigurations.$inferSelect;
export type InsertCustomNecklaceConfiguration = z.infer<typeof insertCustomNecklaceConfigurationSchema>;
export type BraceletBead = typeof braceletBeads.$inferSelect;
export type InsertBraceletBead = z.infer<typeof insertBraceletBeadSchema>;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomBraceletCartItem {
  type: "custom-bracelet";
  configId: string;
  templateName: string;
  charmNames: string[];
  beadNames: string[];
  price: string;
  quantity: number;
}

export interface CustomNecklaceCartItem {
  type: "custom-necklace";
  configId: string;
  templateName: string;
  charmNames: string[];
  price: string;
  quantity: number;
}
