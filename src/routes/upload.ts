import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import cloudinary from "../config/cloudinary";
import prisma from "../lib/prisma";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("[ERROR] Error: File type not allowed"));
    }
  },
});

const uploadToCloudinary = (fileBuffer: Buffer, fileName: string): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", public_id: fileName },
      (error, result) => {
        if (error || !result) {
          console.error("[ERROR] Cloudinary Upload Error:", error);
          reject(new Error("Upload failed"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

router.post("/", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    console.log(`[PROCESS] Uploading: ${req.file.originalname}`);

    const fileExt = path.extname(req.file.originalname);
    const fileNameWithoutExt = req.file.originalname.replace(fileExt, "");
    const uniqueFilename = `${Date.now()}-${encodeURIComponent(fileNameWithoutExt)}`;

    const { url, publicId } = await uploadToCloudinary(req.file.buffer, uniqueFilename);

    console.log(`[DONE] Successfully uploaded! URL: ${url}`);

    const userSessionId = req.session.id;

    await prisma.fileMetadata.create({
      data: {
        publicId,
        userSessionId,
      },
    });

    await res.json({ url, publicId });
  } catch (error) {
    console.error("[ERROR] Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;