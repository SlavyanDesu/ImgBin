import express, { Request, Response } from "express";
import cloudinary from "../configs/cloudinary";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const token = req.query.token;
  if (token !== process.env.CLEANUP_SECRET) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  console.log("[PROCESS] Cleanup process started");
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const filesToDelete = await prisma.fileMetadata.findMany({
      where: {
        createdAt: { lte: threeDaysAgo },
      },
    });

    for (const file of filesToDelete) {
      console.log(`[PROCESS] Deleting file: ${file.publicId}`);
      const result = await cloudinary.uploader.destroy(file.publicId);

      if (result.result !== "ok") {
        console.warn(
          `[WARN] Cloudinary delete failed (might already be gone): ${file.publicId}`,
        );
      } else {
        console.log(`[DONE] Deleted from Cloudinary: ${file.publicId}`);
      }

      await prisma.fileMetadata.delete({
        where: { publicId: file.publicId },
      });
    }
    res.json({
      success: true,
      message: `Deleted ${filesToDelete.length} files`,
    });
  } catch (error) {
    console.error("[ERROR] Cleanup failed:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during cleanup.",
    });
  }
});

export default router;
