import express, { Request, Response } from "express";
import { ResourceApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

const router = express.Router();

/**
 * Formats Cloudinary response into a structured file list.
 * @param resources Cloudinary resource list
 * @returns Formatted file list
 */
const formatFiles = (resources: ResourceApiResponse["resources"]) => {
  return resources.map((file) => ({
    filename: file.public_id,
    size: file.bytes,
    dateUploaded: file.created_at,
    thumbnailUrl: file.secure_url.replace(
      "/upload/",
      "/upload/c_thumb,w_200,h_200/",
    ),
    downloadUrl: file.secure_url,
  }));
};

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("[PROCESS] Fetching uploaded files from Cloudinary...");

    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      max_results: 10,
    });

    const files = formatFiles(result.resources);
    console.log(`[DONE] Successfully retrieved ${files.length} files.`);

    res.render("files", { files });
  } catch (error) {
    console.error("[ERROR] Error fetching files:", error);
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

export default router;
