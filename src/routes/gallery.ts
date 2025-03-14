import express, { Request, Response } from "express";
import { ResourceApiResponse, ResourceType } from "cloudinary";
import cloudinary from "../configs/cloudinary";

const router = express.Router();

interface FormattedFile {
  filename: string;
  size: number;
  dateUploaded: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

const formatFiles = (
  resources: ResourceApiResponse["resources"],
): FormattedFile[] => {
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

    const result: ResourceApiResponse = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image" as ResourceType,
      max_results: 10,
    });

    const files: FormattedFile[] = formatFiles(result.resources);
    console.log(`[DONE] Successfully retrieved ${files.length} files.`);

    res.render("gallery", { files });
  } catch (error) {
    console.error("[ERROR] Error fetching files:", error);
    res.status(500).json({ success: false, message: "Failed to fetch files" });
  }
});

export default router;
