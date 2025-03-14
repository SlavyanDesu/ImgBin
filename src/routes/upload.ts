import express, { Request, Response } from "express";
import path from "path";
import prisma from "../lib/prisma";
import { upload, uploadToCloudinary } from "../services/uploader";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.render("upload");
});

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        url: null,
        publicId: null,
        message: "No file uploaded",
      });
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
        res.status(400).json({
          success: false,
          url: null,
          publicId: null,
          message: "NSFW content detected!",
        });
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

      res.json({
        success: true,
        url: url,
        publicId: publicId,
        message: "File uploaded successfully",
      });
    } catch (error: unknown) {
      console.error("[ERROR] Upload error:", error);
      res.status(500).json({
        success: false,
        url: null,
        publicId: null,
        message: "Internal server error",
      });
    }
  },
);

export default router;
