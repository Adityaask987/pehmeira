import type { Express, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertStyleSchema, updateStyleSchema } from "@shared/schema";
import admin from "firebase-admin";
import { supabase, STYLE_IMAGES_BUCKET } from "./supabase";

// Configure multer for memory storage (Supabase upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
    }
  },
});

// Admin auth middleware
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user from database
    const user = await storage.getUserByGoogleId(decodedToken.uid);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Register admin routes
export function registerAdminRoutes(app: Express) {
  // Upload image endpoint
  app.post("/api/admin/upload", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExt = path.extname(req.file.originalname);
      const fileName = `${randomUUID()}${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STYLE_IMAGES_BUCKET)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return res.status(500).json({ message: "Failed to upload image to storage" });
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STYLE_IMAGES_BUCKET)
        .getPublicUrl(filePath);

      res.json({ url: publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  });

  // Get all styles (admin view)
  app.get("/api/admin/styles", requireAdmin, async (req, res) => {
    try {
      const styles = await storage.getStyles();
      res.json(styles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new style
  app.post("/api/admin/styles", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertStyleSchema.parse(req.body);
      const style = await storage.createStyle(validatedData);
      res.json(style);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update existing style
  app.patch("/api/admin/styles/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = updateStyleSchema.parse(req.body);
      const style = await storage.updateStyle(req.params.id, validatedData);
      res.json(style);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete style
  app.delete("/api/admin/styles/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteStyle(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
