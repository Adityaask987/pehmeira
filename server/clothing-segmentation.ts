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

      // Using Roboflow's clothing detection model
      // Model: clothing-jr7a4/clothing-detection-s4ioc
      const modelEndpoint = `https://detect.roboflow.com/clothing-detection-s4ioc/4`;

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
 */
export function categorizeDetection(className: string): "upper" | "lower" | "footwear" | "accessories" | null {
  const lowerClass = className.toLowerCase();

  // Upper body
  if (
    lowerClass.includes("shirt") ||
    lowerClass.includes("top") ||
    lowerClass.includes("blouse") ||
    lowerClass.includes("jacket") ||
    lowerClass.includes("coat") ||
    lowerClass.includes("sweater") ||
    lowerClass.includes("hoodie") ||
    lowerClass.includes("dress") ||
    lowerClass.includes("kurti") ||
    lowerClass.includes("saree")
  ) {
    return "upper";
  }

  // Lower body
  if (
    lowerClass.includes("pant") ||
    lowerClass.includes("trouser") ||
    lowerClass.includes("jeans") ||
    lowerClass.includes("short") ||
    lowerClass.includes("skirt") ||
    lowerClass.includes("legging") ||
    lowerClass.includes("salwar") ||
    lowerClass.includes("dhoti")
  ) {
    return "lower";
  }

  // Footwear
  if (
    lowerClass.includes("shoe") ||
    lowerClass.includes("sneaker") ||
    lowerClass.includes("boot") ||
    lowerClass.includes("sandal") ||
    lowerClass.includes("heel") ||
    lowerClass.includes("slipper")
  ) {
    return "footwear";
  }

  // Accessories
  if (
    lowerClass.includes("bag") ||
    lowerClass.includes("purse") ||
    lowerClass.includes("hat") ||
    lowerClass.includes("cap") ||
    lowerClass.includes("sunglasses") ||
    lowerClass.includes("watch") ||
    lowerClass.includes("scarf") ||
    lowerClass.includes("belt") ||
    lowerClass.includes("jewelry")
  ) {
    return "accessories";
  }

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
