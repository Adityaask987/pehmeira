import { GoogleGenAI } from "@google/genai";
import pLimit from "p-limit";

// Using Replit's AI Integrations service for Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
  },
});

// Rate limiter: max 3 concurrent image analysis requests
const analysisLimit = pLimit(3);

export interface ImageAnalysis {
  dominantColors: string[]; // Array of color names like ['black', 'red', 'gold']
  colorHexCodes: string[]; // Array of hex codes like ['#000000', '#FF0000', '#FFD700']
  pattern: string; // solid, striped, floral, geometric, polka-dot, abstract, checkered, printed
  patternDetails: string; // Description of the pattern
  garmentType: string; // Type of clothing item
}

/**
 * Analyze an image to extract color and pattern information using Gemini Vision
 * Rate-limited to prevent overwhelming the API
 */
export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
  return analysisLimit(async () => {
    try {
      console.log(`[IMAGE_ANALYSIS] Analyzing image: ${imageUrl}`);
      
      // Fetch the image and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      
      const prompt = `Analyze this fashion/clothing image and provide detailed color and pattern information.

Extract the following in JSON format:
{
  "dominantColors": ["color1", "color2", "color3"], // Top 3-5 most prominent color names (e.g., "black", "red", "navy blue", "golden yellow")
  "colorHexCodes": ["#000000", "#FF0000", "#FFD700"], // Approximate hex codes for the dominant colors
  "pattern": "pattern_type", // One of: solid, striped, floral, geometric, polka-dot, abstract, checkered, printed, paisley, embroidered, lace
  "patternDetails": "description", // Detailed description of the pattern (e.g., "vertical black and white stripes", "small red floral prints on white background")
  "garmentType": "type" // What type of clothing item this is (e.g., "dress", "kurti", "shirt", "jeans", "shoes", "necklace")
}

Be precise with colors - use specific names like "burgundy", "navy blue", "golden yellow" rather than just "red", "blue", "yellow".
For patterns, be detailed - describe the type, size, and arrangement of the pattern.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Image } }
          ]
        }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const analysisText = response.text || "{}";
      const analysis: ImageAnalysis = JSON.parse(analysisText);
      
      console.log(`[IMAGE_ANALYSIS] Result:`, analysis);
      return analysis;
    } catch (error: any) {
      console.error(`[IMAGE_ANALYSIS] Error:`, error.message);
      throw error;
    }
  });
}

/**
 * Calculate color similarity between two sets of colors (0-100%)
 * Uses dominant color matching
 */
export function calculateColorSimilarity(
  colors1: string[],
  colors2: string[]
): number {
  if (!colors1.length || !colors2.length) return 0;

  // Normalize color names for comparison (lowercase, remove spaces)
  const normalizeColor = (color: string) => 
    color.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');

  const normalized1 = colors1.map(normalizeColor);
  const normalized2 = colors2.map(normalizeColor);

  // Count matching colors
  let matches = 0;
  for (const c1 of normalized1) {
    for (const c2 of normalized2) {
      // Exact match
      if (c1 === c2) {
        matches += 1;
        continue;
      }
      
      // Partial match (one color name contains the other)
      if (c1.includes(c2) || c2.includes(c1)) {
        matches += 0.7;
        continue;
      }
      
      // Color family matching (common color synonyms)
      const colorFamilies = [
        ['black', 'charcoal', 'ebony', 'jet'],
        ['white', 'ivory', 'cream', 'offwhite', 'eggshell'],
        ['red', 'crimson', 'scarlet', 'burgundy', 'maroon'],
        ['blue', 'navy', 'cobalt', 'azure', 'sapphire'],
        ['green', 'emerald', 'olive', 'sage', 'lime'],
        ['yellow', 'gold', 'golden', 'mustard', 'amber'],
        ['pink', 'rose', 'blush', 'magenta', 'fuchsia'],
        ['purple', 'violet', 'lavender', 'plum', 'mauve'],
        ['brown', 'tan', 'beige', 'taupe', 'khaki'],
        ['gray', 'grey', 'silver', 'slate', 'charcoal'],
        ['orange', 'coral', 'peach', 'rust', 'terracotta']
      ];
      
      for (const family of colorFamilies) {
        const inFamily1 = family.some(f => c1.includes(f) || f.includes(c1));
        const inFamily2 = family.some(f => c2.includes(f) || f.includes(c2));
        
        if (inFamily1 && inFamily2) {
          matches += 0.5;
          break;
        }
      }
    }
  }

  // Calculate percentage (normalize by the number of colors in the reference image)
  const similarity = (matches / Math.max(colors1.length, colors2.length)) * 100;
  return Math.min(100, Math.round(similarity));
}

/**
 * Calculate pattern similarity between two patterns (0-100%)
 */
export function calculatePatternSimilarity(
  pattern1: string,
  patternDetails1: string,
  pattern2: string,
  patternDetails2: string
): number {
  const normalize = (str: string) => str.toLowerCase().trim();
  
  const p1 = normalize(pattern1);
  const p2 = normalize(pattern2);
  const d1 = normalize(patternDetails1);
  const d2 = normalize(patternDetails2);

  // Exact pattern type match = 100%
  if (p1 === p2) {
    return 100;
  }

  // Pattern families (similar patterns)
  const patternFamilies = [
    ['solid', 'plain', 'single color', 'onecolor'],
    ['striped', 'stripes', 'stripy', 'lined'],
    ['floral', 'flower', 'flowers', 'botanical'],
    ['geometric', 'shapes', 'angular', 'abstract'],
    ['polka-dot', 'polkadot', 'dots', 'spotted'],
    ['checkered', 'checked', 'plaid', 'gingham'],
    ['printed', 'print', 'graphic'],
    ['paisley', 'paisley print'],
    ['embroidered', 'embroidery'],
    ['lace', 'lacework']
  ];

  // Check if patterns are in the same family
  for (const family of patternFamilies) {
    const in1 = family.some(f => p1.includes(f) || f.includes(p1));
    const in2 = family.some(f => p2.includes(f) || f.includes(p2));
    
    if (in1 && in2) {
      // Same family, check details for finer similarity
      const detailWords1 = d1.split(/\s+/);
      const detailWords2 = d2.split(/\s+/);
      
      let commonWords = 0;
      for (const word1 of detailWords1) {
        if (word1.length < 3) continue; // Skip short words
        if (detailWords2.some(word2 => word1.includes(word2) || word2.includes(word1))) {
          commonWords++;
        }
      }
      
      const detailSimilarity = (commonWords / Math.max(detailWords1.length, detailWords2.length)) * 100;
      return Math.min(100, Math.round(80 + (detailSimilarity * 0.2))); // 80-100%
    }
  }

  // Check if pattern keywords appear in details
  if (d1.includes(p2) || d2.includes(p1)) {
    return 50; // Partial match
  }

  // No similarity
  return 0;
}
