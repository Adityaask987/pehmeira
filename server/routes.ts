import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWishlistItemSchema, updateUserProfileSchema, type ProductSearchResponse, type SearchedProduct } from "@shared/schema";
import { fetchRetailProducts, fetchProductById, findSimilarProducts } from "./retail-api";
import admin from "firebase-admin";
import { registerAdminRoutes } from "./admin";

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

      // Indian e-commerce domain whitelist
      const indianDomains = [
        'amazon.in',
        'flipkart.com',
        'myntra.com',
        'ajio.com',
        'meesho.com'
      ];

      // Keyword taxonomy for precise categorization
      const categoryKeywords = {
        upper: {
          include: ['top', 'shirt', 'blouse', 'tshirt', 't-shirt', 'kurti', 'kurta', 'tunic', 'sweater', 
                   'jacket', 'blazer', 'cardigan', 'hoodie', 'sweatshirt', 'crop', 'tank', 'cami', 
                   'polo', 'button', 'sleeve', 'collar', 'bodice'],
          exclude: ['pant', 'jean', 'trouser', 'skirt', 'short', 'legging', 'shoe', 'boot', 'sandal', 
                   'sneaker', 'heel', 'bag', 'watch', 'necklace', 'bracelet', 'ring', 'earring']
        },
        lower: {
          include: ['pant', 'jean', 'trouser', 'skirt', 'short', 'legging', 'jogger', 'track', 
                   'palazzo', 'salwar', 'dhoti', 'capri', 'culottes', 'chino', 'cargo', 'denim'],
          exclude: ['top', 'shirt', 'blouse', 'shoe', 'boot', 'sandal', 'sneaker', 'heel', 
                   'bag', 'watch', 'necklace', 'bracelet', 'jacket', 'sweater']
        },
        footwear: {
          include: ['shoe', 'boot', 'sandal', 'sneaker', 'heel', 'slipper', 'flip', 'flop', 
                   'loafer', 'oxford', 'derby', 'moccasin', 'wedge', 'pump', 'stiletto', 
                   'ankle boot', 'chelsea', 'trainer', 'runner', 'kicks'],
          exclude: ['shirt', 'pant', 'skirt', 'bag', 'watch', 'necklace', 'bracelet', 'ring']
        },
        accessories: {
          include: ['bag', 'watch', 'necklace', 'bracelet', 'ring', 'earring', 'jewel', 'jewelry', 
                   'pendant', 'chain', 'bangle', 'anklet', 'brooch', 'scarf', 'stole', 'belt', 
                   'wallet', 'purse', 'clutch', 'handbag', 'sling', 'tote', 'backpack', 'sunglass'],
          exclude: ['shoe', 'boot', 'sandal', 'sneaker', 'shirt', 'pant', 'skirt', 'jean']
        }
      };

      // Function to check if URL is from Indian e-commerce
      const isIndianEcommerce = (url: string): boolean => {
        try {
          const hostname = new URL(url).hostname.toLowerCase();
          return indianDomains.some(domain => 
            hostname === domain || 
            hostname.endsWith(`.${domain}`) ||
            hostname.includes(domain)
          );
        } catch {
          return false;
        }
      };

      // Function to categorize product based on title
      const categorizeProduct = (title: string): 'upper' | 'lower' | 'footwear' | 'accessories' | null => {
        const lowerTitle = title.toLowerCase();
        
        type Category = 'upper' | 'lower' | 'footwear' | 'accessories';
        const categories: Category[] = ['upper', 'lower', 'footwear', 'accessories'];
        
        // Score each category
        const scores: Record<Category, number> = {
          upper: 0,
          lower: 0,
          footwear: 0,
          accessories: 0
        };

        for (const category of categories) {
          const keywords = categoryKeywords[category];
          
          // Add points for include keywords
          for (const keyword of keywords.include) {
            if (lowerTitle.includes(keyword)) {
              scores[category] += 10;
            }
          }
          
          // Subtract points for exclude keywords (stronger penalty)
          for (const keyword of keywords.exclude) {
            if (lowerTitle.includes(keyword)) {
              scores[category] -= 50;
            }
          }
        }

        // Find category with highest score (must be positive)
        let bestCategory: Category | null = null;
        let bestScore = 0;

        for (const category of categories) {
          if (scores[category] > bestScore) {
            bestScore = scores[category];
            bestCategory = category;
          }
        }

        return bestScore > 0 ? bestCategory : null;
      };

      // Make ONE API call with India parameters
      const apiUrl = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(imageUrl)}&gl=in&hl=en&api_key=${apiKey}`;
      console.log(`[SEARCH] Fetching products for India market`);
      console.log(`[SEARCH] Image URL:`, imageUrl);
      
      const lensResponse = await fetch(apiUrl);
      
      if (!lensResponse.ok) {
        const errorText = await lensResponse.text();
        console.error(`[SEARCH] Failed:`, lensResponse.statusText);
        console.error(`[SEARCH] Error details:`, errorText);
        return res.status(500).json({ message: "Failed to fetch products from Google Lens" });
      }

      const lensData = await lensResponse.json();
      console.log(`[SEARCH] Total visual_matches:`, (lensData.visual_matches || []).length);
      
      if (lensData.error) {
        console.error(`[SEARCH] SerpAPI error:`, lensData.error);
        return res.status(500).json({ message: lensData.error });
      }
      
      const visualMatches = lensData.visual_matches || [];
      
      // Categorize and filter all products
      const categorized: Record<'upper' | 'lower' | 'footwear' | 'accessories', any[]> = {
        upper: [],
        lower: [],
        footwear: [],
        accessories: []
      };

      let processedCount = 0;
      let indianSiteCount = 0;
      let categorizedCount = 0;

      for (const item of visualMatches) {
        processedCount++;
        
        // Filter 1: Must be from Indian e-commerce
        if (!isIndianEcommerce(item.link || '')) {
          continue;
        }
        indianSiteCount++;

        // Filter 2: Must be categorizable
        const category = categorizeProduct(item.title || '');
        if (!category) {
          continue;
        }
        categorizedCount++;

        categorized[category].push(item);
      }

      console.log(`[SEARCH] Processed ${processedCount} items, ${indianSiteCount} from Indian sites, ${categorizedCount} categorized`);
      console.log(`[SEARCH] Upper: ${categorized.upper.length}, Lower: ${categorized.lower.length}, Footwear: ${categorized.footwear.length}, Accessories: ${categorized.accessories.length}`);

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
