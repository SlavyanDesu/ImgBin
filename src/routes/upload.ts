import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import * as nsfwjs from "nsfwjs";
import { createCanvas, loadImage } from "canvas";
import cloudinary from "../config/cloudinary";
import prisma from "../lib/prisma";
import { UploadApiResponse } from "cloudinary";

const router = express.Router();

let nsfwModel: nsfwjs.NSFWJS | null = null;

const loadModel = async () => {
  nsfwModel = await nsfwjs.load("MobileNetV2");
  console.log("[NSFWJS] NSFWJS model loaded!");
};

loadModel();

const isNsfw = async (imageBuffer: Buffer) => {
  if (!nsfwModel) throw new Error("NSFW model is not loaded");
  const img = await loadImage(imageBuffer);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0, img.width, img.height);

  const predictions = await nsfwModel.classify(
    canvas as unknown as HTMLCanvasElement,
  );

  return predictions;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("[ERROR] Error: File type not allowed"));
    }
  },
});

const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
): Promise<{ url: string; publicId: string } | null> => {
  const predictions = await isNsfw(fileBuffer);
  const formattedPredictions = predictions
    .map((p) => `${p.className}: ${(p.probability * 100).toFixed(2)}%`)
    .join("\n");
  console.log(`[NSFWJS] Predictions:\n${formattedPredictions}`);

  const nsfwScore = predictions.find(
    (p) => p.className === "Porn" || p.className === "Hentai",
  );

  if (nsfwScore && nsfwScore.probability > 0.5) {
    console.warn("[NSFWJS] Upload blocked due to NSFW content");
    return null;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", public_id: fileName },
      (error: Error | undefined, result?: UploadApiResponse) => {
        if (error || !result) {
          console.error("[ERROR] Cloudinary Upload Error:", error);
          reject(new Error("Upload failed"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      },
    );
    uploadStream.end(fileBuffer);
  });
};

router.get("/", (req: Request, res: Response) => {
  res.render("upload");
});

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    try {
      console.log(`[PROCESS] Uploading: ${req.file.originalname}`);

      const fileExt: string = path.extname(req.file.originalname);
      const fileNameWithoutExt: string = req.file.originalname.replace(
        fileExt,
        "",
      );
      const uniqueFilename: string = `${Date.now()}-${encodeURIComponent(fileNameWithoutExt)}`;

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        uniqueFilename,
      );

      if (!uploadResult) {
        res.status(400).json({ message: "NSFW content detected!" });
        return;
      }

      const { url, publicId } = uploadResult;

      console.log(`[DONE] Successfully uploaded! URL: ${url}`);

      const userId: string = req.cookies.userId;

      await prisma.fileMetadata.create({
        data: {
          publicId,
          userId: userId,
        },
      });

      res.json({ url, publicId });
    } catch (error: unknown) {
      console.error("[ERROR] Upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
