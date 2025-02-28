import express, { Request, Response } from "express";
import cloudinary from "../config/cloudinary";

const router = express.Router();

/**
 * DELETE /delete/:publicId
 * Deletes a file from Cloudinary by its public ID.
 */
router.delete("/:publicId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;
    
    console.log(`[PROCESS] Fetching file details for: ${publicId}`);

    // Check if file exists
    const fileInfo = await cloudinary.api.resource(publicId).catch(() => null);
    if (!fileInfo) {
      console.warn(`[WARN] File not found: ${publicId}`);
      res.status(404).json({ message: "File not found" });
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
    res.json({ success: true, message: "File deleted successfully" });
    
  } catch (error) {
    console.error(`[ERROR] Delete error:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
