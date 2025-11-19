import axios from "axios";
import pLimit from "p-limit";

// Rate limiter: max 3 concurrent Roboflow API requests
const roboflowLimit = pLimit(3);

export interface ClothingDetection {
  class: string; // shirt, pants, shoes, dress, etc.
  confidence: number;
  x: number; // center x
  y: number; // center y
  width: number;
  height: number;
}

export interface SegmentationResult {
  detections: ClothingDetection[];
  imageWidth: number;
  imageHeight: number;
}

export interface CroppedGarment {
  category: "upper" | "lower" | "footwear" | "accessories";
  imageBuffer: Buffer;
  confidence: number;
  className: string;
}

/**
 * Detect clothing items in an image using Roboflow API
 * Uses the free Roboflow clothing detection model
 */
export async function detectClothing(imageUrl: string): Promise<SegmentationResult> {
  return roboflowLimit(async () => {
    try {
      const apiKey = process.env.ROBOFLOW_API_KEY;
      if (!apiKey) {
        throw new Error("ROBOFLOW_API_KEY not found in environment variables");
      }

      console.log(`[ROBOFLOW] Detecting clothing in image: ${imageUrl}`);

      // Using custom Roboflow model for Indian fashion
      // Workspace: aditya-singh-kshatriya-r3kpr
      // Model: find-lower-body-clothes-upper-body-clothes-shoes-and-jewellery-and-bags-and-watches
      const modelEndpoint = `https://detect.roboflow.com/find-lower-body-clothes-upper-body-clothes-shoes-and-jewellery-and-bags-and-watches/1`;

      const response = await axios({
        method: "POST",
        url: modelEndpoint,
        params: {
          api_key: apiKey,
          confidence: 30, // 30% confidence threshold
          overlap: 30,
          image: imageUrl,
        },
      });

      const data = response.data;
      console.log(`[ROBOFLOW] Detected ${data.predictions?.length || 0} clothing items`);

      return {
        detections: data.predictions?.map((pred: any) => ({
          class: pred.class,
          confidence: pred.confidence,
          x: pred.x,
          y: pred.y,
          width: pred.width,
          height: pred.height,
        })) || [],
        imageWidth: data.image?.width || 0,
        imageHeight: data.image?.height || 0,
      };
    } catch (error: any) {
      console.error(`[ROBOFLOW] Error detecting clothing:`, error.message);
      throw error;
    }
  });
}

/**
 * Categorize detected clothing items into searchable categories
 * Maps custom Roboflow model classes to product categories
 * 
 * Model classes:
 * - "upper body clothes"
 * - "lower body clothes"
 * - "shoes"
 * - "jewelleries and bags and watches"
 */
export function categorizeDetection(className: string): "upper" | "lower" | "footwear" | "accessories" | null {
  const lowerClass = className.toLowerCase();

  // Direct mapping for custom model classes
  if (lowerClass.includes("upper body") || lowerClass.includes("upper-body")) {
    return "upper";
  }

  if (lowerClass.includes("lower body") || lowerClass.includes("lower-body")) {
    return "lower";
  }

  if (lowerClass.includes("shoe")) {
    return "footwear";
  }

  if (lowerClass.includes("jeweller") || lowerClass.includes("bag") || lowerClass.includes("watch")) {
    return "accessories";
  }

  // Fallback: try generic patterns
  if (
    lowerClass.includes("shirt") ||
    lowerClass.includes("top") ||
    lowerClass.includes("blouse") ||
    lowerClass.includes("jacket") ||
    lowerClass.includes("kurti")
  ) {
    return "upper";
  }

  if (
    lowerClass.includes("pant") ||
    lowerClass.includes("jeans") ||
    lowerClass.includes("skirt") ||
    lowerClass.includes("legging")
  ) {
    return "lower";
  }

  console.log(`[CATEGORIZE] Unknown class: ${className}`);
  return null;
}

/**
 * Download image from URL as buffer
 */
async function downloadImage(imageUrl: string): Promise<Buffer> {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "binary");
}

/**
 * Crop image buffer based on bounding box coordinates
 * Uses sharp for image processing
 */
async function cropImageRegion(
  imageBuffer: Buffer,
  detection: ClothingDetection,
  imageWidth: number,
  imageHeight: number
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;

  // Convert center-based coordinates to top-left coordinates
  const left = Math.max(0, Math.round(detection.x - detection.width / 2));
  const top = Math.max(0, Math.round(detection.y - detection.height / 2));
  const width = Math.min(Math.round(detection.width), imageWidth - left);
  const height = Math.min(Math.round(detection.height), imageHeight - top);

  console.log(`[CROP] ${detection.class}: {left: ${left}, top: ${top}, width: ${width}, height: ${height}}`);

  return await sharp(imageBuffer)
    .extract({ left, top, width, height })
    .toBuffer();
}

/**
 * Detect clothing and crop each garment region
 * Returns cropped images for Google Lens search
 */
export async function segmentAndCropGarments(imageUrl: string): Promise<CroppedGarment[]> {
  try {
    // Step 1: Detect clothing items
    const segmentation = await detectClothing(imageUrl);

    if (!segmentation.detections || segmentation.detections.length === 0) {
      console.log(`[SEGMENTATION] No clothing items detected in image`);
      return [];
    }

    // Step 2: Download original image
    const imageBuffer = await downloadImage(imageUrl);

    // Step 3: Crop each detected garment
    const croppedGarments: CroppedGarment[] = [];

    for (const detection of segmentation.detections) {
      const category = categorizeDetection(detection.class);

      if (!category) {
        console.log(`[SEGMENTATION] Skipping unknown class: ${detection.class}`);
        continue;
      }

      try {
        const croppedBuffer = await cropImageRegion(
          imageBuffer,
          detection,
          segmentation.imageWidth,
          segmentation.imageHeight
        );

        croppedGarments.push({
          category,
          imageBuffer: croppedBuffer,
          confidence: detection.confidence,
          className: detection.class,
        });

        console.log(
          `[SEGMENTATION] Cropped ${detection.class} (${category}) - confidence: ${(detection.confidence * 100).toFixed(1)}%`
        );
      } catch (cropError: any) {
        console.error(`[SEGMENTATION] Failed to crop ${detection.class}:`, cropError.message);
      }
    }

    return croppedGarments;
  } catch (error: any) {
    console.error(`[SEGMENTATION] Error:`, error.message);
    return [];
  }
}
