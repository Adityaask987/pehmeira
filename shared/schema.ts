import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  gender: text("gender").notNull(),
  bodyType: text("body_type").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const wishlistItems = pgTable("wishlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemType: text("item_type").notNull(),
  itemId: text("item_id").notNull(),
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({
  id: true,
});

export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;

export type BodyType = {
  id: string;
  name: string;
  description: string;
  gender: string;
  illustration: string;
};

export type Occasion = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type Style = {
  id: string;
  name: string;
  designer: string;
  description: string;
  occasion: string;
  bodyType: string;
  gender: string;
  image: string;
  products: string[];
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  retailer: string;
  image: string;
  matchPercentage?: number;
  description: string;
};

export type Category = "shirts" | "pants" | "shoes" | "accessories" | "all";
