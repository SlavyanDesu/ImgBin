import express, { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import prisma from "../lib/prisma";

const router = express.Router();

router.delete(
  "/:publicId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { publicId } = req.params;
      const userSessionId = req.cookies.userId;

      console.log(`[PROCESS] Fetching file details for: ${publicId}`);

      const fileMetadata = await prisma.fileMetadata.findUnique({
        where: { publicId },
      });

      if (!fileMetadata) {
        console.warn(`[WARN] File not found: ${publicId}`);
        res.status(404).json({ message: "File not found" });
        return;
      }

      if (fileMetadata.userSessionId !== userSessionId) {
        console.warn(`[WARN] Unauthorized delete attempt for: ${publicId}`);
        res
          .status(403)
          .json({ message: "You do not have permission to delete this file" });
        return;
      }

      console.log(`[PROCESS] Deleting file: ${publicId}`);

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== "ok") {
        console.warn(`[WARN] Failed to delete: ${publicId}`);
        res.status(400).json({ message: "Failed to delete file" });
        return;
      }

      console.log(`[DONE] File deleted: ${publicId}`);

      await prisma.fileMetadata.delete({
        where: { publicId },
      });

      res.json({ success: true, message: "File deleted successfully" });
    } catch (error: unknown) {
      console.error(`[ERROR] Delete error:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
