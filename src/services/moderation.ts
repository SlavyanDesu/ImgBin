import vision from "@google-cloud/vision";
import * as nsfwjs from "nsfwjs";
import { createCanvas, loadImage } from "canvas";
import { MODERATION_METHOD } from "../middlewares";

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

if (MODERATION_METHOD === "nsfwjs") {
  console.log("[MODERATION] Using NSFWJS...");

  let model: nsfwjs.NSFWJS | null = null;

  const loadModel = async () => {
    model = await nsfwjs.load("MobileNetV2"); // Using MobileNetV2, change it whatever you like
  };

  loadModel();

  isNsfw = async (imageBuffer: Buffer) => {
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);

    const predictions = await model?.classify(
      canvas as unknown as HTMLCanvasElement,
    );
    return predictions ?? [];
  };
} else if (MODERATION_METHOD === "google-vision") {
  console.log("[MODERATION] Using Google Vision API...");
  const client = new vision.ImageAnnotatorClient();

  isNsfw = async (imageBuffer: Buffer) => {
    const request = {
      image: {
        content: imageBuffer.toString("base64"),
      },
    };
    const [result] = await client.annotateImage(request);
    const predictions = result.safeSearchAnnotation as SafeSearchAnnotation;
    return predictions;
  };
} else {
  console.error("[MODERATION] Invalid moderation method!");
}

export { isNsfw };
