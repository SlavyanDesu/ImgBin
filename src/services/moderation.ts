import vision from "@google-cloud/vision";
import * as nsfwjs from "nsfwjs";
import { createCanvas, loadImage } from "canvas";
import { MODERATION_METHOD } from "../config/serverConfig";

export interface SafeSearchAnnotation {
  adult?: string;
  spoof?: string;
  medical?: string;
  violence?: string;
  racy?: string;
}

let isNsfw:
  | ((
      imageBuffer: Buffer,
    ) => Promise<SafeSearchAnnotation | nsfwjs.PredictionType[]>)
  | null = null;
let formattedPredictions: string | null = null;

const initializeNsfwjs = async () => {
  console.log("[DEBUG] Initializing NSFWJS...");

  const model = await nsfwjs.load("MobileNetV2");

  return async (imageBuffer: Buffer) => {
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);
    const predictions = await model.classify(
      canvas as unknown as HTMLCanvasElement,
    );

    formattedPredictions = predictions
      ? predictions
          .map((p) => `${p.className}: ${(p.probability * 100).toFixed(2)}%`)
          .join("\n")
      : "[MODERATION] No predictions available";

    console.log(`[MODERATION] Predictions:\n${formattedPredictions}`);
    return predictions ?? [];
  };
};

const initializeGoogleVision = async () => {
  console.log("[DEBUG] Initializing Google Vision...");

  const client = new vision.ImageAnnotatorClient();

  return async (imageBuffer: Buffer) => {
    const request = {
      image: {
        content: imageBuffer.toString("base64"),
      },
      features: [{ type: "SAFE_SEARCH_DETECTION" }],
    };
    const [result] = await client.annotateImage(request);
    const predictions = result.safeSearchAnnotation as SafeSearchAnnotation;

    formattedPredictions = Object.entries(predictions)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    console.log(`[MODERATION] Predictions:\n${formattedPredictions}`);
    return predictions;
  };
};

const initializeModerationMethod = async () => {
  switch (MODERATION_METHOD) {
    case "nsfwjs":
      isNsfw = await initializeNsfwjs();
      break;
    case "google-vision":
      isNsfw = await initializeGoogleVision();
      break;
    default:
      console.error("[MODERATION] Invalid moderation method");
      isNsfw = null;
  }
};

initializeModerationMethod().catch((error) => {
  console.error("[ERROR] Failed to initialize moderation method:", error);
});

export { isNsfw };
