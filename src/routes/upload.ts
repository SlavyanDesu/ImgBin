import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import cloudinary from "../config/cloudinary";
import prisma from "../lib/prisma";
import { UploadApiResponse } from "cloudinary";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const filetypes = /jpeg|jpg|png|gif|mp4/;
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

const uploadToCloudinary = (
  fileBuffer: Buffer,
  fileName: string,
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", public_id: fileName },
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
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

      const { url, publicId } = await uploadToCloudinary(
        req.file.buffer,
        uniqueFilename,
      );

      console.log(`[DONE] Successfully uploaded! URL: ${url}`);

      const userId: string = req.cookies.userId;

      await prisma.fileMetadata.create({
        data: {
          publicId,
          userSessionId: userId,
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
