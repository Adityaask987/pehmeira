import {
  type User,
  type InsertUser,
  type WishlistItem,
  type InsertWishlistItem,
  type Style,
  type InsertStyle,
  type UpdateStyle,
  type Product,
  type OtpVerification,
  type InsertOtpVerification,
  type Session,
  type InsertSession,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db, users as usersTable, wishlistItems as wishlistTable, otpVerifications as otpTable, sessions as sessionsTable, styles as stylesTable } from "./db";
import { eq, and, gt } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  getValidOtp(identifier: string, code: string): Promise<OtpVerification | undefined>;
  deleteOtp(id: string): Promise<void>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  
  getStyles(gender?: string, bodyType?: string, occasion?: string): Promise<Style[]>;
  getStyle(id: string): Promise<Style | undefined>;
  createStyle(style: InsertStyle): Promise<Style>;
  updateStyle(id: string, updates: UpdateStyle): Promise<Style>;
  deleteStyle(id: string): Promise<void>;
  
  getProducts(category?: string): Promise<Product[]>;
  
  getWishlist(userId: string): Promise<WishlistItem[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: string): Promise<void>;
  getWishlistItem(userId: string, itemType: string, itemId: string): Promise<WishlistItem | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private wishlist: Map<string, WishlistItem>;
  private otpVerifications: Map<string, OtpVerification>;
  private sessions: Map<string, Session>;
  private styles: Style[];
  private products: Product[];

  constructor() {
    this.users = new Map();
    this.wishlist = new Map();
    this.otpVerifications = new Map();
    this.sessions = new Map();
    this.styles = this.initializeStyles();
    this.products = this.initializeProducts();
  }

  private initializeStyles(): Style[] {
    const now = new Date();
    return [
      {
        id: "style-1",
        name: "Elegant Evening Ensemble",
        designer: "Sophia Laurent",
        description: "A sophisticated black dress paired with statement gold jewelry, perfect for making an unforgettable impression at formal events.",
        occasion: "formal",
        bodyType: "hourglass",
        gender: "female",
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
        products: ["prod-1", "prod-5", "prod-9"],
        createdAt: now,
      },
      {
        id: "style-2",
        name: "Modern Professional",
        designer: "Marcus Chen",
        description: "Sharp tailored blazer with crisp white shirt and slim-fit trousers. Confident and polished for the boardroom.",
        occasion: "business",
        bodyType: "rectangle-male",
        gender: "male",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
        products: ["prod-2", "prod-6", "prod-10"],
        createdAt: now,
      },
      {
        id: "style-3",
        name: "Casual Chic Weekend",
        designer: "Emma Rodriguez",
        description: "Effortlessly stylish with a flowing blouse, high-waisted jeans, and minimalist accessories for relaxed sophistication.",
        occasion: "casual",
        bodyType: "pear",
        gender: "female",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
        products: ["prod-3", "prod-7", "prod-11"],
        createdAt: now,
      },
      {
        id: "style-4",
        name: "Romantic Date Night",
        designer: "Isabella Stone",
        description: "Delicate lace details and soft silhouettes create an enchanting look perfect for intimate evenings.",
        occasion: "date-night",
        bodyType: "hourglass",
        gender: "female",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
        products: ["prod-4", "prod-8", "prod-12"],
        createdAt: now,
      },
      {
        id: "style-5",
        name: "Smart Casual Blazer Look",
        designer: "James Mitchell",
        description: "Versatile navy blazer styled with chinos and loafers for polished casual sophistication.",
        occasion: "casual",
        bodyType: "trapezoid-male",
        gender: "male",
        image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80",
        products: ["prod-13", "prod-14", "prod-15"],
        createdAt: now,
      },
      {
        id: "style-6",
        name: "Party Ready Glamour",
        designer: "Sophia Laurent",
        description: "Sequined top with sleek pants and bold accessories for standout party presence.",
        occasion: "party",
        bodyType: "rectangle",
        gender: "female",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
        products: ["prod-16", "prod-17", "prod-18"],
        createdAt: now,
      },
      {
        id: "style-7",
        name: "Sultry Date Night",
        designer: "Valentina Cruz",
        description: "Bold lace bodysuit with high-waisted leather skirt and thigh-high boots for a confident, show-stopping evening look.",
        occasion: "date-night",
        bodyType: "plus-size",
        gender: "female",
        image: "/attached_assets/Plus_D1_1761306109712.jpeg",
        products: ["prod-4", "prod-17", "prod-8"],
        createdAt: now,
      },
      {
        id: "style-8",
        name: "Glamorous Evening Out",
        designer: "Valentina Cruz",
        description: "Luxe lace top paired with sleek leather mini skirt and statement boots for an unforgettable date night ensemble.",
        occasion: "date-night",
        bodyType: "plus-size",
        gender: "female",
        image: "/attached_assets/Plus_D2_1761306109716.jpg",
        products: ["prod-4", "prod-17", "prod-8"],
        createdAt: now,
      },
    ];
  }

  private initializeProducts(): Product[] {
    return [
      {
        id: "prod-1",
        name: "Classic Black Sheath Dress",
        category: "shirts",
        price: 189,
        retailer: "Nordstrom",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
        matchPercentage: 98,
        description: "Timeless elegance in a perfectly tailored silhouette",
      },
      {
        id: "prod-2",
        name: "Navy Wool Blazer",
        category: "shirts",
        price: 325,
        retailer: "Brooks Brothers",
        image: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=600&q=80",
        matchPercentage: 95,
        description: "Premium wool construction with modern slim fit",
      },
      {
        id: "prod-3",
        name: "Silk Floral Blouse",
        category: "shirts",
        price: 145,
        retailer: "Saks Fifth Avenue",
        image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&q=80",
        matchPercentage: 92,
        description: "Luxurious silk with delicate floral print",
      },
      {
        id: "prod-4",
        name: "Lace Midi Dress",
        category: "shirts",
        price: 210,
        retailer: "Neiman Marcus",
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
        matchPercentage: 96,
        description: "Romantic lace detailing with flattering midi length",
      },
      {
        id: "prod-5",
        name: "Gold Statement Necklace",
        category: "accessories",
        price: 85,
        retailer: "Madewell",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
        matchPercentage: 94,
        description: "Bold geometric design in polished gold",
      },
      {
        id: "prod-6",
        name: "Oxford White Dress Shirt",
        category: "shirts",
        price: 98,
        retailer: "J.Crew",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        matchPercentage: 97,
        description: "Crisp cotton with perfect collar shape",
      },
      {
        id: "prod-7",
        name: "High-Waisted Denim Jeans",
        category: "pants",
        price: 168,
        retailer: "Levi's Premium",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
        matchPercentage: 93,
        description: "Vintage-inspired fit with modern comfort",
      },
      {
        id: "prod-8",
        name: "Strappy Evening Heels",
        category: "shoes",
        price: 245,
        retailer: "Stuart Weitzman",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
        matchPercentage: 95,
        description: "Elegant stiletto with delicate strap details",
      },
      {
        id: "prod-9",
        name: "Black Leather Clutch",
        category: "accessories",
        price: 195,
        retailer: "Coach",
        image: "https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=600&q=80",
        matchPercentage: 91,
        description: "Sleek leather with gold hardware accent",
      },
      {
        id: "prod-10",
        name: "Slim Fit Charcoal Trousers",
        category: "pants",
        price: 145,
        retailer: "Banana Republic",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
        matchPercentage: 96,
        description: "Modern tailored fit in premium fabric",
      },
      {
        id: "prod-11",
        name: "Leather Ankle Boots",
        category: "shoes",
        price: 285,
        retailer: "Sam Edelman",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
        matchPercentage: 89,
        description: "Versatile ankle boot with stacked heel",
      },
      {
        id: "prod-12",
        name: "Gold Bangle Set",
        category: "accessories",
        price: 68,
        retailer: "Kendra Scott",
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=600&q=80",
        matchPercentage: 90,
        description: "Stackable bangles in various textures",
      },
      {
        id: "prod-13",
        name: "Navy Slim Fit Blazer",
        category: "shirts",
        price: 298,
        retailer: "Hugo Boss",
        image: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=600&q=80",
        matchPercentage: 97,
        description: "Italian wool with structured shoulders",
      },
      {
        id: "prod-14",
        name: "Khaki Chino Pants",
        category: "pants",
        price: 89,
        retailer: "Dockers",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
        matchPercentage: 94,
        description: "Classic fit with stretch comfort",
      },
      {
        id: "prod-15",
        name: "Brown Leather Loafers",
        category: "shoes",
        price: 195,
        retailer: "Cole Haan",
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80",
        matchPercentage: 92,
        description: "Penny loafer with cushioned insole",
      },
      {
        id: "prod-16",
        name: "Gold Sequin Crop Top",
        category: "shirts",
        price: 128,
        retailer: "Zara",
        image: "https://images.unsplash.com/photo-1564442038901-4f9a19d3d456?w=600&q=80",
        matchPercentage: 93,
        description: "Party-ready with allover sequin coverage",
      },
      {
        id: "prod-17",
        name: "Black Wide Leg Pants",
        category: "pants",
        price: 135,
        retailer: "& Other Stories",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
        matchPercentage: 91,
        description: "Flowy silhouette with high waist",
      },
      {
        id: "prod-18",
        name: "Gold Statement Earrings",
        category: "accessories",
        price: 72,
        retailer: "Baublebar",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
        matchPercentage: 95,
        description: "Oversized hoops with textured finish",
      },
      {
        id: "prod-19",
        name: "White Sneakers",
        category: "shoes",
        price: 125,
        retailer: "Veja",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
        matchPercentage: 88,
        description: "Minimalist leather sneakers",
      },
      {
        id: "prod-20",
        name: "Leather Crossbody Bag",
        category: "accessories",
        price: 165,
        retailer: "Fossil",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80",
        matchPercentage: 86,
        description: "Compact size with adjustable strap",
      },
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      name: insertUser.name ?? null,
      username: insertUser.username ?? null,
      phone: insertUser.phone ?? null,
      email: insertUser.email ?? null,
      googleId: insertUser.googleId ?? null,
      authMethod: insertUser.authMethod,
      profilePicture: insertUser.profilePicture ?? null,
      isAdmin: insertUser.isAdmin ?? false,
      gender: insertUser.gender ?? null,
      bodyType: insertUser.bodyType ?? null,
      shirtSize: insertUser.shirtSize ?? null,
      pantSize: insertUser.pantSize ?? null,
      shoeSize: insertUser.shoeSize ?? null,
      favoriteBrands: insertUser.favoriteBrands ?? null,
      minBudget: insertUser.minBudget ?? null,
      maxBudget: insertUser.maxBudget ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getStyles(gender?: string, bodyType?: string, occasion?: string): Promise<Style[]> {
    let filtered = this.styles;
    
    if (gender) {
      filtered = filtered.filter(s => s.gender === gender);
    }
    if (bodyType) {
      filtered = filtered.filter(s => s.bodyType === bodyType);
    }
    if (occasion) {
      filtered = filtered.filter(s => s.occasion === occasion);
    }
    
    return filtered;
  }

  async getProducts(category?: string): Promise<Product[]> {
    if (category && category !== "all") {
      return this.products.filter(p => p.category === category);
    }
    return this.products;
  }

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return Array.from(this.wishlist.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToWishlist(insertItem: InsertWishlistItem): Promise<WishlistItem> {
    const id = randomUUID();
    const item: WishlistItem = { ...insertItem, id };
    this.wishlist.set(id, item);
    return item;
  }

  async removeFromWishlist(id: string): Promise<void> {
    this.wishlist.delete(id);
  }

  async getWishlistItem(
    userId: string,
    itemType: string,
    itemId: string
  ): Promise<WishlistItem | undefined> {
    return Array.from(this.wishlist.values()).find(
      (item) =>
        item.userId === userId &&
        item.itemType === itemType &&
        item.itemId === itemId
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async createOtpVerification(insertOtp: InsertOtpVerification): Promise<OtpVerification> {
    const id = randomUUID();
    const otp: OtpVerification = { 
      ...insertOtp, 
      id,
      createdAt: new Date()
    };
    this.otpVerifications.set(id, otp);
    return otp;
  }

  async getValidOtp(identifier: string, code: string): Promise<OtpVerification | undefined> {
    const now = new Date();
    return Array.from(this.otpVerifications.values()).find(
      (otp) =>
        otp.identifier === identifier &&
        otp.code === code &&
        otp.expiresAt > now
    );
  }

  async deleteOtp(id: string): Promise<void> {
    this.otpVerifications.delete(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = { 
      ...insertSession, 
      id,
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const now = new Date();
    return Array.from(this.sessions.values()).find(
      (session) => session.token === token && session.expiresAt > now
    );
  }

  async deleteSession(token: string): Promise<void> {
    const sessionToDelete = Array.from(this.sessions.values()).find(
      (session) => session.token === token
    );
    if (sessionToDelete) {
      this.sessions.delete(sessionToDelete.id);
    }
  }

  async getStyle(id: string): Promise<Style | undefined> {
    throw new Error("Not implemented in MemStorage");
  }

  async createStyle(style: InsertStyle): Promise<Style> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateStyle(id: string, updates: UpdateStyle): Promise<Style> {
    throw new Error("Not implemented in MemStorage");
  }

  async deleteStyle(id: string): Promise<void> {
    throw new Error("Not implemented in MemStorage");
  }
}

// Database storage implementation using Drizzle ORM
export class DbStorage implements IStorage {
  private products: Product[];

  constructor() {
    this.products = this.initializeProducts();
  }

  private initializeProducts(): Product[] {
    return [
      {
        id: "prod-1",
        name: "Classic Black Sheath Dress",
        category: "shirts",
        price: 189,
        retailer: "Nordstrom",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
        matchPercentage: 98,
        description: "Timeless elegance in a perfectly tailored silhouette",
      },
      {
        id: "prod-2",
        name: "Navy Wool Blazer",
        category: "shirts",
        price: 325,
        retailer: "Brooks Brothers",
        image: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=600&q=80",
        matchPercentage: 95,
        description: "Premium wool construction with modern slim fit",
      },
      {
        id: "prod-3",
        name: "Silk Floral Blouse",
        category: "shirts",
        price: 145,
        retailer: "Saks Fifth Avenue",
        image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&q=80",
        matchPercentage: 92,
        description: "Luxurious silk with delicate floral print",
      },
      {
        id: "prod-4",
        name: "Lace Midi Dress",
        category: "shirts",
        price: 210,
        retailer: "Neiman Marcus",
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
        matchPercentage: 96,
        description: "Romantic lace detailing with flattering midi length",
      },
      {
        id: "prod-5",
        name: "Gold Statement Necklace",
        category: "accessories",
        price: 85,
        retailer: "Madewell",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
        matchPercentage: 94,
        description: "Bold geometric design in polished gold",
      },
      {
        id: "prod-6",
        name: "Oxford White Dress Shirt",
        category: "shirts",
        price: 98,
        retailer: "J.Crew",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        matchPercentage: 97,
        description: "Crisp cotton with perfect collar shape",
      },
      {
        id: "prod-7",
        name: "High-Waisted Denim Jeans",
        category: "pants",
        price: 168,
        retailer: "Levi's Premium",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
        matchPercentage: 93,
        description: "Vintage-inspired fit with modern comfort",
      },
      {
        id: "prod-8",
        name: "Strappy Evening Heels",
        category: "shoes",
        price: 245,
        retailer: "Stuart Weitzman",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
        matchPercentage: 95,
        description: "Elegant stiletto with delicate strap details",
      },
      {
        id: "prod-9",
        name: "Black Leather Clutch",
        category: "accessories",
        price: 195,
        retailer: "Coach",
        image: "https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=600&q=80",
        matchPercentage: 91,
        description: "Sleek leather with gold hardware accent",
      },
      {
        id: "prod-10",
        name: "Slim Fit Charcoal Trousers",
        category: "pants",
        price: 145,
        retailer: "Banana Republic",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
        matchPercentage: 96,
        description: "Modern tailored fit in premium fabric",
      },
      {
        id: "prod-11",
        name: "Leather Ankle Boots",
        category: "shoes",
        price: 285,
        retailer: "Sam Edelman",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
        matchPercentage: 89,
        description: "Versatile ankle boot with stacked heel",
      },
      {
        id: "prod-12",
        name: "Gold Bangle Set",
        category: "accessories",
        price: 68,
        retailer: "Kendra Scott",
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=600&q=80",
        matchPercentage: 90,
        description: "Stackable bangles in various textures",
      },
      {
        id: "prod-13",
        name: "Navy Slim Fit Blazer",
        category: "shirts",
        price: 298,
        retailer: "Hugo Boss",
        image: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=600&q=80",
        matchPercentage: 97,
        description: "Italian wool with structured shoulders",
      },
      {
        id: "prod-14",
        name: "Khaki Chino Pants",
        category: "pants",
        price: 89,
        retailer: "Dockers",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
        matchPercentage: 94,
        description: "Classic fit with stretch comfort",
      },
      {
        id: "prod-15",
        name: "Brown Leather Loafers",
        category: "shoes",
        price: 195,
        retailer: "Cole Haan",
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80",
        matchPercentage: 92,
        description: "Penny loafer with cushioned insole",
      },
      {
        id: "prod-16",
        name: "Gold Sequin Crop Top",
        category: "shirts",
        price: 128,
        retailer: "Zara",
        image: "https://images.unsplash.com/photo-1564442038901-4f9a19d3d456?w=600&q=80",
        matchPercentage: 93,
        description: "Party-ready with allover sequin coverage",
      },
      {
        id: "prod-17",
        name: "Black Wide Leg Pants",
        category: "pants",
        price: 135,
        retailer: "& Other Stories",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
        matchPercentage: 91,
        description: "Flowy silhouette with high waist",
      },
      {
        id: "prod-18",
        name: "Gold Statement Earrings",
        category: "accessories",
        price: 72,
        retailer: "Baublebar",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
        matchPercentage: 95,
        description: "Oversized hoops with textured finish",
      },
      {
        id: "prod-19",
        name: "White Sneakers",
        category: "shoes",
        price: 125,
        retailer: "Veja",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
        matchPercentage: 88,
        description: "Minimalist leather sneakers",
      },
      {
        id: "prod-20",
        name: "Leather Crossbody Bag",
        category: "accessories",
        price: 165,
        retailer: "Fossil",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80",
        matchPercentage: 86,
        description: "Compact size with adjustable strap",
      },
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log("[STORAGE] Attempting to insert user into Supabase:", { 
        googleId: insertUser.googleId, 
        email: insertUser.email 
      });
      
      const result = await db.insert(usersTable).values(insertUser).returning();
      
      if (!result || result.length === 0) {
        throw new Error("Database insert returned no results");
      }
      
      console.log("[STORAGE] User successfully inserted:", result[0].id);
      return result[0];
    } catch (error: any) {
      console.error("[STORAGE] Failed to create user in database:", {
        error: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table,
      });
      
      // Preserve structured error information
      const dbError: any = new Error();
      
      if (error.code === '23505') { // Unique constraint violation
        dbError.message = `User already exists: ${error.detail || error.message}`;
        dbError.code = error.code;
        dbError.constraint = error.constraint;
      } else if (error.code === '23503') { // Foreign key violation
        dbError.message = `Invalid reference: ${error.detail || error.message}`;
        dbError.code = error.code;
        dbError.constraint = error.constraint;
      } else if (error.code === '23502') { // Not null violation
        dbError.message = `Missing required field: ${error.detail || error.message}`;
        dbError.code = error.code;
        dbError.column = error.column;
      } else {
        dbError.message = `Database error: ${error.message}`;
        dbError.code = error.code;
        dbError.detail = error.detail;
      }
      
      // Preserve original error properties for debugging
      dbError.pgCode = error.code;
      dbError.pgDetail = error.detail;
      dbError.pgHint = error.hint;
      
      throw dbError;
    }
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const result = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    return result[0];
  }

  async getStyles(gender?: string, bodyType?: string, occasion?: string): Promise<Style[]> {
    let query = db.select().from(stylesTable);
    const conditions = [];
    if (gender) conditions.push(eq(stylesTable.gender, gender));
    if (bodyType) conditions.push(eq(stylesTable.bodyType, bodyType));
    if (occasion) conditions.push(eq(stylesTable.occasion, occasion));
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    return await query;
  }

  async getStyle(id: string): Promise<Style | undefined> {
    const result = await db.select().from(stylesTable).where(eq(stylesTable.id, id));
    return result[0];
  }

  async createStyle(style: InsertStyle): Promise<Style> {
    const result = await db.insert(stylesTable).values(style).returning();
    return result[0];
  }

  async updateStyle(id: string, updates: UpdateStyle): Promise<Style> {
    const result = await db.update(stylesTable).set(updates).where(eq(stylesTable.id, id)).returning();
    return result[0];
  }

  async deleteStyle(id: string): Promise<void> {
    await db.delete(stylesTable).where(eq(stylesTable.id, id));
  }

  async getProducts(category?: string): Promise<Product[]> {
    if (category && category !== "all") {
      return this.products.filter(p => p.category === category);
    }
    return this.products;
  }

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return await db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId));
  }

  async addToWishlist(insertItem: InsertWishlistItem): Promise<WishlistItem> {
    const result = await db.insert(wishlistTable).values(insertItem).returning();
    return result[0];
  }

  async removeFromWishlist(id: string): Promise<void> {
    await db.delete(wishlistTable).where(eq(wishlistTable.id, id));
  }

  async getWishlistItem(
    userId: string,
    itemType: string,
    itemId: string
  ): Promise<WishlistItem | undefined> {
    const result = await db
      .select()
      .from(wishlistTable)
      .where(
        and(
          eq(wishlistTable.userId, userId),
          eq(wishlistTable.itemType, itemType),
          eq(wishlistTable.itemId, itemId)
        )
      );
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.googleId, googleId));
    return result[0];
  }

  async createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification> {
    const result = await db.insert(otpTable).values(otp).returning();
    return result[0];
  }

  async getValidOtp(identifier: string, code: string): Promise<OtpVerification | undefined> {
    const result = await db
      .select()
      .from(otpTable)
      .where(
        and(
          eq(otpTable.identifier, identifier),
          eq(otpTable.code, code),
          gt(otpTable.expiresAt, new Date())
        )
      );
    return result[0];
  }

  async deleteOtp(id: string): Promise<void> {
    await db.delete(otpTable).where(eq(otpTable.id, id));
  }

  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(sessionsTable).values(session).returning();
    return result[0];
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const result = await db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.token, token),
          gt(sessionsTable.expiresAt, new Date())
        )
      );
    return result[0];
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }
}

export const storage = new DbStorage();
