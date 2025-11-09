import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWishlistItemSchema, updateUserProfileSchema, type ProductSearchResponse, type SearchedProduct } from "@shared/schema";
import { fetchRetailProducts, fetchProductById, findSimilarProducts } from "./retail-api";
import admin from "firebase-admin";

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
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      const { uid, email, name, profilePicture } = req.body;
      
      let user = await storage.getUserByGoogleId(uid);
      
      if (!user) {
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
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = (req as any).firebaseUser;
      const user = await storage.getUserByGoogleId(firebaseUser.uid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
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

      const searchQueries = {
        upper: `${style.gender} top blouse shirt`,
        lower: `${style.gender} pants skirt bottoms`,
        accessories: `${style.gender} accessories jewelry bag`,
        footwear: `${style.gender} shoes heels boots`
      };

      const categories = ['upper', 'lower', 'accessories', 'footwear'] as const;
      const results: ProductSearchResponse = {
        upper: [],
        lower: [],
        accessories: [],
        footwear: []
      };

      const fetchCategoryProducts = async (category: typeof categories[number]) => {
        try {
          const lensResponse = await fetch(
            `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(imageUrl)}&q=${encodeURIComponent(searchQueries[category])}&api_key=${apiKey}`
          );
          
          if (!lensResponse.ok) {
            console.error(`Failed to fetch ${category} products:`, lensResponse.statusText);
            return { category, products: [] };
          }

          const lensData = await lensResponse.json();
          const visualMatches = lensData.visual_matches || [];
          
          const products = visualMatches.slice(0, 10).map((item: any, index: number): SearchedProduct => ({
            title: item.title || 'Untitled Product',
            price: item.price?.value || item.price || 'Price not available',
            source: item.source || 'Unknown',
            link: item.link || '#',
            thumbnail: item.thumbnail || item.image || '',
            category: category,
            rating: item.rating,
            reviews: item.reviews,
            matchPercentage: 98 - (index * 3)
          }));

          return { category, products };
        } catch (error: any) {
          console.error(`Error fetching ${category} products:`, error.message);
          return { category, products: [] };
        }
      };

      const categoryResults = await Promise.all(
        categories.map(category => fetchCategoryProducts(category))
      );

      categoryResults.forEach(({ category, products }) => {
        results[category] = products;
      });

      res.json(results);
    } catch (error: any) {
      console.error('Product search error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
