import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  // Authentication fields
  phone: text("phone").unique(),
  email: text("email").unique(),
  googleId: text("google_id").unique(),
  authMethod: text("auth_method").notNull(),
  name: text("name"),
  profilePicture: text("profile_picture"),
  // Admin field
  isAdmin: boolean("is_admin").default(false).notNull(),
  // Onboarding preferences
  gender: text("gender"),
  bodyType: text("body_type"),
  // Profile preferences
  shirtSize: text("shirt_size"),
  pantSize: text("pant_size"),
  shoeSize: text("shoe_size"),
  favoriteBrands: text("favorite_brands").array(),
  minBudget: integer("min_budget"),
  maxBudget: integer("max_budget"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const createUserWithPhoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().optional(),
  authMethod: z.literal("phone"),
});

export const createUserWithEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  authMethod: z.literal("email"),
});

export const createUserWithGoogleSchema = z.object({
  googleId: z.string(),
  email: z.string().email(),
  name: z.string(),
  profilePicture: z.string().optional(),
  authMethod: z.literal("google"),
});

export const sendOtpSchema = z.object({
  identifier: z.string().min(1, "Phone number or email is required"),
  type: z.enum(["phone", "email"]),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1),
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  profilePicture: z.string().optional(),
  gender: z.string().optional(),
  bodyType: z.string().optional(),
  shirtSize: z.string().optional(),
  pantSize: z.string().optional(),
  shoeSize: z.string().optional(),
  favoriteBrands: z.array(z.string()).optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
}).refine(
  (data) => {
    if (data.minBudget !== undefined && data.minBudget !== null && 
        data.maxBudget !== undefined && data.maxBudget !== null) {
      return data.minBudget <= data.maxBudget;
    }
    return true;
  },
  {
    message: "Minimum budget must be less than or equal to maximum budget",
    path: ["minBudget"],
  }
);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type CreateUserWithPhone = z.infer<typeof createUserWithPhoneSchema>;
export type CreateUserWithEmail = z.infer<typeof createUserWithEmailSchema>;
export type CreateUserWithGoogle = z.infer<typeof createUserWithGoogleSchema>;
export type SendOtp = z.infer<typeof sendOtpSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;

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

export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: text("identifier").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export const styles = pgTable("styles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  designer: text("designer").notNull(),
  description: text("description").notNull(),
  occasion: text("occasion").notNull(),
  bodyType: text("body_type").notNull(),
  gender: text("gender").notNull(),
  image: text("image").notNull(),
  products: text("products").array().default(sql`ARRAY[]::text[]`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStyleSchema = createInsertSchema(styles).omit({
  id: true,
  createdAt: true,
});

export const updateStyleSchema = z.object({
  name: z.string().optional(),
  designer: z.string().optional(),
  description: z.string().optional(),
  occasion: z.string().optional(),
  bodyType: z.string().optional(),
  gender: z.string().optional(),
  image: z.string().optional(),
  products: z.array(z.string()).optional(),
});

export type InsertStyle = z.infer<typeof insertStyleSchema>;
export type UpdateStyle = z.infer<typeof updateStyleSchema>;
export type Style = typeof styles.$inferSelect;

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

export type SearchedProduct = {
  title: string;
  price: string;
  source: string;
  link: string;
  thumbnail: string;
  category: "upper" | "lower" | "accessories" | "footwear";
  rating?: number;
  reviews?: number;
  matchPercentage: number;
};

export type ProductSearchRequest = {
  styleId: string;
};

export type ProductSearchResponse = {
  upper: SearchedProduct[];
  lower: SearchedProduct[];
  accessories: SearchedProduct[];
  footwear: SearchedProduct[];
};
