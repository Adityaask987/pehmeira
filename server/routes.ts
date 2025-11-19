import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWishlistItemSchema, updateUserProfileSchema, type ProductSearchResponse, type SearchedProduct } from "@shared/schema";
import { fetchRetailProducts, fetchProductById, findSimilarProducts } from "./retail-api";
import admin from "firebase-admin";
import { registerAdminRoutes } from "./admin";
import { segmentAndCropGarments, type CroppedGarment } from "./clothing-segmentation";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).firebaseUser = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register admin routes
  registerAdminRoutes(app);
  
  app.post("/api/auth/login", async (req, res) => {
    console.log("🔐 [AUTH] Login request received");
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ [AUTH] No authorization header or invalid format");
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split("Bearer ")[1];
      console.log("🔑 [AUTH] Verifying Firebase token...");
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log("✅ [AUTH] Token verified for UID:", decodedToken.uid);
      
      const { uid, email, name, profilePicture } = req.body;
      console.log("👤 [AUTH] User data from request:", { uid, email, name });
      
      let user = await storage.getUserByGoogleId(uid);
      
      if (!user) {
        console.log("➕ [AUTH] Creating new user in database...");
        user = await storage.createUser({
          googleId: uid,
          email: email || null,
          name: name || null,
          profilePicture: profilePicture || null,
          authMethod: "google",
          username: null,
          phone: null,
          gender: null,
          bodyType: null,
          shirtSize: null,
          pantSize: null,
          shoeSize: null,
          favoriteBrands: null,
          minBudget: null,
          maxBudget: null,
        });
        console.log("✅ [AUTH] User created with ID:", user.id);
      } else {
        console.log("✅ [AUTH] Existing user found:", user.id);
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("❌ [AUTH] Login error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", verifyFirebaseToken, async (req, res) => {
    console.log("🔍 [AUTH] /me request received");
    try {
      const firebaseUser = (req as any).firebaseUser;
      console.log("👤 [AUTH] Looking up user with UID:", firebaseUser.uid);
      const user = await storage.getUserByGoogleId(firebaseUser.uid);
      
      if (!user) {
        console.log("❌ [AUTH] User not found in database");
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("✅ [AUTH] User found:", user.id);
      res.json(user);
    } catch (error: any) {
      console.error("❌ [AUTH] /me error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const validatedData = updateUserProfileSchema.parse(req.body);
      const user = await storage.updateUser(req.params.id, validatedData);
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

  // Retail API endpoints for live product search
  app.get("/api/retail/products", async (req, res) => {
    try {
      const { category, minPrice, maxPrice, brands, gender, query } = req.query;
      
      const filters = {
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        brands: brands ? (brands as string).split(',') : undefined,
        gender: gender as string,
        query: query as string,
      };
      
      const products = await fetchRetailProducts(filters);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/retail/products/:id", async (req, res) => {
    try {
      const product = await fetchProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/retail/products/:id/similar", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const products = await findSimilarProducts(req.params.id, limit);
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

  app.post("/api/search-products", async (req, res) => {
    try {
      const { styleId } = req.body;
      
      if (!styleId) {
        return res.status(400).json({ message: "styleId is required" });
      }

      const apiKey = process.env.SERPAPI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "SERPAPI_API_KEY not configured" });
      }

      const styles = await storage.getStyles();
      const style = styles.find(s => s.id === styleId);
      
      if (!style) {
        return res.status(404).json({ message: "Style not found" });
      }

      const imageUrl = style.image.startsWith('http') 
        ? style.image 
        : `${req.protocol}://${req.get('host')}${style.image}`;

      console.log(`[SEGMENTATION] Starting clothing segmentation for style ${styleId}`);
      console.log(`[SEGMENTATION] Image URL: ${imageUrl}`);
      
      // Indian e-commerce merchant names (for Shopping API source field)
      const indianMerchants = ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho'];

      // Function to check if source is from Indian merchant
      const isIndianMerchant = (source: string): boolean => {
        const lowerSource = source.toLowerCase();
        return indianMerchants.some(merchant => lowerSource.includes(merchant));
      };

      // Results storage
      const categorized: Record<'upper' | 'lower' | 'footwear' | 'accessories', any[]> = {
        upper: [],
        lower: [],
        footwear: [],
        accessories: []
      };

      // Step 1: Try clothing segmentation with Roboflow
      let croppedGarments: any[] = [];
      try {
        croppedGarments = await segmentAndCropGarments(imageUrl);
        console.log(`[SEGMENTATION] Detected ${croppedGarments.length} garments`);
      } catch (error: any) {
        console.error(`[SEGMENTATION] Roboflow failed:`, error.message);
        console.log(`[SEGMENTATION] Falling back to full image search`);
      }

      // Step 2A: If segmentation successful, search per garment
      if (croppedGarments.length > 0) {
        console.log(`[SEARCH] Searching Google Lens for ${croppedGarments.length} cropped garments...`);

        for (const garment of croppedGarments) {
          try {
            // Convert image buffer to base64
            const base64Image = garment.imageBuffer.toString('base64');
            const dataUri = `data:image/jpeg;base64,${base64Image}`;

            console.log(`[SEARCH] Searching for ${garment.className} (${garment.category})...`);

            // Call Google Lens with base64 image
            const apiUrl = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(dataUri)}&gl=in&hl=en&api_key=${apiKey}`;
            
            const lensResponse = await fetch(apiUrl);
            if (!lensResponse.ok) {
              console.error(`[SEARCH] Google Lens failed for ${garment.className}`);
              continue;
            }

            const lensData = await lensResponse.json();
            const visualMatches = lensData.visual_matches || [];

            console.log(`[SEARCH] Found ${visualMatches.length} matches for ${garment.className}`);

            // Filter for Indian merchants and add to categorized results
            for (const item of visualMatches) {
              const source = item.source || '';
              if (isIndianMerchant(source)) {
                const category = garment.category as 'upper' | 'lower' | 'footwear' | 'accessories';
                categorized[category].push(item);
              }
            }
          } catch (error: any) {
            console.error(`[SEARCH] Error searching for ${garment.className}:`, error.message);
          }
        }
      } 
      // Step 2B: Fallback - search full image with Google Shopping API
      else {
        console.log(`[FALLBACK] Using Google Shopping API for all categories`);
        
        const categoryQueries = {
          upper: `women top shirt blouse kurti india`,
          lower: `women pants jeans skirt leggings india`,
          footwear: `women shoes heels boots sandals india`,
          accessories: `women jewelry necklace bracelet watch bag india`
        };

        const fallbackResults = await Promise.all(
          Object.entries(categoryQueries).map(async ([category, query]) => {
            try {
              const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&gl=in&google_domain=google.co.in&hl=en&num=15&api_key=${apiKey}`;
              
              const shoppingResponse = await fetch(shoppingUrl);
              if (!shoppingResponse.ok) {
                console.error(`[FALLBACK] Shopping API failed for ${category}`);
                return { category, items: [] };
              }

              const shoppingData = await shoppingResponse.json();
              const shoppingResults = shoppingData.shopping_results || [];
              
              console.log(`[FALLBACK] Found ${shoppingResults.length} results for ${category}`);
              
              // Filter by Indian merchants
              const validItems = shoppingResults
                .filter((item: any) => isIndianMerchant(item.source || ''))
                .map((item: any) => ({
                  ...item,
                  link: item.product_link || item.link || '#'
                }))
                .slice(0, 10);

              return { category: category as 'upper' | 'lower' | 'footwear' | 'accessories', items: validItems };
            } catch (error: any) {
              console.error(`[FALLBACK] Error for ${category}:`, error.message);
              return { category: category as 'upper' | 'lower' | 'footwear' | 'accessories', items: [] };
            }
          })
        );

        // Merge fallback results
        fallbackResults.forEach(({ category, items }) => {
          const cat = category as 'upper' | 'lower' | 'footwear' | 'accessories';
          categorized[cat].push(...items);
        });
      }

      console.log(`[SEARCH] Final Results - Upper: ${categorized.upper.length}, Lower: ${categorized.lower.length}, Footwear: ${categorized.footwear.length}, Accessories: ${categorized.accessories.length}`)

      // Build final results - top 10 per category
      const results: ProductSearchResponse = {
        upper: categorized.upper.slice(0, 10).map((item, index): SearchedProduct => ({
          title: item.title || 'Untitled Product',
          price: item.price?.value || item.price || 'Price not available',
          source: item.source || 'Unknown',
          link: item.link || '#',
          thumbnail: item.thumbnail || item.image || '',
          category: 'upper',
          rating: item.rating,
          reviews: item.reviews,
          matchPercentage: 98 - (index * 3)
        })),
        lower: categorized.lower.slice(0, 10).map((item, index): SearchedProduct => ({
          title: item.title || 'Untitled Product',
          price: item.price?.value || item.price || 'Price not available',
          source: item.source || 'Unknown',
          link: item.link || '#',
          thumbnail: item.thumbnail || item.image || '',
          category: 'lower',
          rating: item.rating,
          reviews: item.reviews,
          matchPercentage: 98 - (index * 3)
        })),
        footwear: categorized.footwear.slice(0, 10).map((item, index): SearchedProduct => ({
          title: item.title || 'Untitled Product',
          price: item.price?.value || item.price || 'Price not available',
          source: item.source || 'Unknown',
          link: item.link || '#',
          thumbnail: item.thumbnail || item.image || '',
          category: 'footwear',
          rating: item.rating,
          reviews: item.reviews,
          matchPercentage: 98 - (index * 3)
        })),
        accessories: categorized.accessories.slice(0, 10).map((item, index): SearchedProduct => ({
          title: item.title || 'Untitled Product',
          price: item.price?.value || item.price || 'Price not available',
          source: item.source || 'Unknown',
          link: item.link || '#',
          thumbnail: item.thumbnail || item.image || '',
          category: 'accessories',
          rating: item.rating,
          reviews: item.reviews,
          matchPercentage: 98 - (index * 3)
        }))
      };

      res.json(results);
    } catch (error: any) {
      console.error('Product search error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
