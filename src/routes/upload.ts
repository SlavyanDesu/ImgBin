import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import cloudinary from "../config/cloudinary";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// Helper function for uploading to Cloudinary
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

// File upload route
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
    await res.json({ url, publicId });
  } catch (error) {
    console.error("[ERROR] Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
