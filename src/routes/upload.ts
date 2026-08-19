import express, { Request, Response } from "express";
import path from "path";
import prisma from "../lib/prisma";
import { randomUUID } from "crypto";
import { upload, uploadToCloudinary } from "../services/uploader";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.render("upload");
});

router.post(
  "/",
  upload.array("file", 10),
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        results: [],
        message: "No files uploaded",
      });
      return;
    }

    try {
      const userId: string = req.cookies.userId;
      const results = [];

      for (const file of files) {
        console.log(`[PROCESS] Uploading: ${file.originalname}`);

        const fileExt: string = path.extname(file.originalname);
        const fileNameWithoutExt: string = file.originalname.replace(
          fileExt,
          "",
        );

        const uniqueFilename = `${randomUUID()}-${encodeURIComponent(
          fileNameWithoutExt,
        )}`;

        const uploadResult = await uploadToCloudinary(
          file.buffer,
          uniqueFilename,
        );

        if (!uploadResult) {
          console.warn(`[BLOCKED] NSFW content detected: ${file.originalname}`);

          results.push({
            filename: file.originalname,
            success: false,
            message: "NSFW content detected!",
          });

          continue;
        }

        const { url, publicId } = uploadResult;

        console.log(`[DONE] Successfully uploaded! URL: ${url}`);

        await prisma.fileMetadata.create({
          data: {
            publicId,
            userId,
          },
        });

        results.push({
          filename: file.originalname,
          success: true,
          url,
          publicId,
          message: "File uploaded successfully",
        });
      }

      res.json({
        success: true,
        results,
        message: `${results.filter((result) => result.success).length} file(s) uploaded successfully`,
      });
    } catch (error: unknown) {
      console.error("[ERROR] Upload error:", error);

      res.status(500).json({
        success: false,
        results: [],
        message: "Internal server error",
      });
    }
  },
);

export default router;
