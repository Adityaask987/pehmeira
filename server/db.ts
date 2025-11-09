import { drizzle } from "drizzle-orm/neon-serverless";
import { users, wishlistItems, otpVerifications, sessions } from "@shared/schema";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  ws: ws,
});

export { users, wishlistItems, otpVerifications, sessions };
