import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWishlistItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/styles", async (req, res) => {
    try {
      const { gender, bodyType, occasion } = req.query;
      const styles = await storage.getStyles(
        gender as string,
        bodyType as string,
        occasion as string
      );
      res.json(styles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      const products = await storage.getProducts(category as string);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/wishlist", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default-user";
      const wishlist = await storage.getWishlist(userId);
      res.json(wishlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const data = {
        userId: req.body.userId || "default-user",
        itemType: req.body.itemType,
        itemId: req.body.itemId,
      };
      
      const validatedData = insertWishlistItemSchema.parse(data);
      
      const existing = await storage.getWishlistItem(
        validatedData.userId,
        validatedData.itemType,
        validatedData.itemId
      );

      if (existing) {
        return res.json(existing);
      }

      const item = await storage.addToWishlist(validatedData);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      await storage.removeFromWishlist(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
