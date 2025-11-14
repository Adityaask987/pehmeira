import { db, styles } from "./db";
import { InsertStyle } from "@shared/schema";

const seedStyles: Omit<InsertStyle, "createdAt">[] = [
  {
    name: "Elegant Evening Ensemble",
    designer: "Sophia Laurent",
    description: "A sophisticated black dress paired with statement gold jewelry, perfect for making an unforgettable impression at formal events.",
    occasion: "formal",
    bodyType: "hourglass",
    gender: "female",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
    products: ["prod-1", "prod-5", "prod-9"],
  },
  {
    name: "Modern Professional",
    designer: "Marcus Chen",
    description: "Sharp tailored blazer with crisp white shirt and slim-fit trousers. Confident and polished for the boardroom.",
    occasion: "business",
    bodyType: "rectangle-male",
    gender: "male",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    products: ["prod-2", "prod-6", "prod-10"],
  },
  {
    name: "Casual Chic Weekend",
    designer: "Emma Rodriguez",
    description: "Effortlessly stylish with a flowing blouse, high-waisted jeans, and minimalist accessories for relaxed sophistication.",
    occasion: "casual",
    bodyType: "pear",
    gender: "female",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    products: ["prod-3", "prod-7", "prod-11"],
  },
  {
    name: "Romantic Date Night",
    designer: "Isabella Stone",
    description: "Delicate lace details and soft silhouettes create an enchanting look perfect for intimate evenings.",
    occasion: "date-night",
    bodyType: "hourglass",
    gender: "female",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
    products: ["prod-4", "prod-8", "prod-12"],
  },
  {
    name: "Smart Casual Blazer Look",
    designer: "James Mitchell",
    description: "Versatile navy blazer styled with chinos and loafers for polished casual sophistication.",
    occasion: "casual",
    bodyType: "trapezoid-male",
    gender: "male",
    image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80",
    products: ["prod-13", "prod-14", "prod-15"],
  },
  {
    name: "Party Ready Glamour",
    designer: "Sophia Laurent",
    description: "Sequined top with sleek pants and bold accessories for standout party presence.",
    occasion: "party",
    bodyType: "rectangle",
    gender: "female",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    products: ["prod-16", "prod-17", "prod-18"],
  },
  {
    name: "Sultry Date Night",
    designer: "Valentina Cruz",
    description: "Bold lace bodysuit with high-waisted leather skirt and thigh-high boots for a confident, show-stopping evening look.",
    occasion: "date-night",
    bodyType: "plus-size",
    gender: "female",
    image: "/attached_assets/Plus_D1_1761306109712.jpeg",
    products: ["prod-4", "prod-17", "prod-8"],
  },
  {
    name: "Glamorous Evening Out",
    designer: "Valentina Cruz",
    description: "Luxe lace top paired with sleek leather mini skirt and statement boots for an unforgettable date night ensemble.",
    occasion: "date-night",
    bodyType: "plus-size",
    gender: "female",
    image: "/attached_assets/Plus_D2_1761306109716.jpg",
    products: ["prod-4", "prod-17", "prod-8"],
  },
];

export async function seedDatabase() {
  try {
    console.log("Seeding styles...");
    
    // Check if styles already exist
    const existingStyles = await db.select().from(styles);
    
    if (existingStyles.length === 0) {
      // Insert seed styles
      await db.insert(styles).values(seedStyles);
      console.log(`✓ Inserted ${seedStyles.length} styles`);
    } else {
      console.log(`✓ Database already has ${existingStyles.length} styles, skipping seed`);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log("Seed complete");
    process.exit(0);
  }).catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
}
