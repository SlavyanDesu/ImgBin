import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { isNsfw } from "./moderation";
import { MODERATION_METHOD } from "../middlewares";
import path from "path";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

const fileTypes = /jpeg|jpg|png/;
const fileSize = 10 * 1024 * 1024; // 10 MB
const nsfwThreshold = 0.5;

interface UploadResult {
  url: string;
  publicId: string;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: fileSize },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const ext = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (ext && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("[ERROR] File type not allowed!"));
    }
  },
});

const isContentNsfw = async (fileBuffer: Buffer): Promise<boolean> => {
  if (!isNsfw) return false;
  const predictions = await isNsfw(fileBuffer);

  if (MODERATION_METHOD === "nsfwjs" && Array.isArray(predictions)) {
    const nsfwScore = predictions.find(
      (p) => p.className === "Porn" || p.className === "Hentai",
    );

    if (nsfwScore && nsfwScore.probability !== undefined)
      return nsfwScore.probability > nsfwThreshold;
  } else if (!Array.isArray(predictions)) {
    return (
      predictions.adult === "LIKELY" ||
      predictions.adult === "VERY_LIKELY" ||
      predictions.racy === "LIKELY" ||
      predictions.racy === "VERY_LIKELY"
    );
  }
  return false;
};

const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
): Promise<UploadResult | null> => {
  const isNsfwContent = await isContentNsfw(fileBuffer);
  if (isNsfwContent) {
    console.warn("[MODERATION] Upload blocked due to NSFW content");
    return null;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", public_id: fileName },
      (error: Error | undefined, result?: UploadApiResponse) => {
        if (error || !result) {
          console.error("[ERROR] Cloudinary upload error:", error);
          reject(new Error("Upload failed"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};

export { upload, uploadToCloudinary };
