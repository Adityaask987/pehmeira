import type { Express, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertStyleSchema, updateStyleSchema } from "@shared/schema";
import admin from "firebase-admin";

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/styles");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: uploadStorage,
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
  app.post("/api/admin/upload", requireAdmin, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const imageUrl = `/uploads/styles/${req.file.filename}`;
    res.json({ url: imageUrl });
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
