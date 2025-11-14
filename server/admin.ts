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

// Helper function to extract filename from Supabase URL
function extractFilenameFromUrl(url: string): string | null {
  try {
    // URL format: https://{project}.supabase.co/storage/v1/object/public/style-images/{filename}?t=...
    // Parse URL to handle query params and extract just the filename
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract everything after 'style-images/'
    const bucketPath = `/object/public/${STYLE_IMAGES_BUCKET}/`;
    const bucketIndex = pathname.indexOf(bucketPath);
    
    if (bucketIndex === -1) {
      return null;
    }
    
    // Get filename without query params or hash
    const filename = pathname.substring(bucketIndex + bucketPath.length);
    return filename || null;
  } catch {
    return null;
  }
}

// Helper function to delete image from Supabase Storage
async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Check if URL matches configured Supabase host and storage path
    const urlObj = new URL(imageUrl);
    const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).host : '';
    
    const isSupabaseUrl = (
      imageUrl.includes('/storage/v1/object/public/') && 
      urlObj.host.toLowerCase() === supabaseHost.toLowerCase()
    );
    
    if (!isSupabaseUrl) {
      return; // Skip legacy /uploads/styles/ URLs or non-matching hosts
    }

    const filename = extractFilenameFromUrl(imageUrl);
    if (!filename) {
      console.warn('Could not extract filename from Supabase URL:', imageUrl);
      return;
    }

    const { error } = await supabase.storage
      .from(STYLE_IMAGES_BUCKET)
      .remove([filename]);
    
    if (error) {
      console.error('Failed to delete image from storage:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

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
      
      // Store old image URL if image is being updated
      let oldImageUrl: string | null = null;
      if (validatedData.image) {
        const existingStyle = await storage.getStyle(req.params.id);
        if (existingStyle && existingStyle.image && existingStyle.image !== validatedData.image) {
          oldImageUrl = existingStyle.image;
        }
      }
      
      // Update database first
      const style = await storage.updateStyle(req.params.id, validatedData);
      
      // Only delete old image from storage after successful DB update
      if (oldImageUrl) {
        await deleteImageFromStorage(oldImageUrl);
      }
      
      res.json(style);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete style
  app.delete("/api/admin/styles/:id", requireAdmin, async (req, res) => {
    try {
      // Get style first to retrieve image URL
      const style = await storage.getStyle(req.params.id);
      
      // Delete from database first
      await storage.deleteStyle(req.params.id);
      
      // Only cleanup storage after successful database deletion
      if (style && style.image) {
        await deleteImageFromStorage(style.image);
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
