import express, { Request, Response } from "express";
import cloudinary from "../configs/cloudinary";

const router = express.Router();

const FILES_PER_PAGE = 12;

interface FormattedFile {
  filename: string;
  size: number;
  dateUploaded: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

interface CloudinaryResource {
  public_id: string;
  bytes: number;
  created_at: string;
  secure_url: string;
}

interface CloudinarySearchResult {
  resources: CloudinaryResource[];
  total_count?: number;
  next_cursor?: string;
}

interface CloudinarySearchQuery {
  expression: (expression: string) => CloudinarySearchQuery;
  sort_by: (field: string, direction: string) => CloudinarySearchQuery;
  max_results: (count: number) => CloudinarySearchQuery;
  next_cursor: (cursor: string) => CloudinarySearchQuery;
  execute: () => Promise<CloudinarySearchResult>;
}

const formatFiles = (resources: CloudinaryResource[]): FormattedFile[] => {
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

    let currentPage = Number.parseInt(req.query.page as string, 10);

    if (!Number.isInteger(currentPage) || currentPage < 1) {
      currentPage = 1;
    }

    let cursor: string | undefined;
    let result: CloudinarySearchResult | undefined;

    for (let page = 1; page <= currentPage; page++) {
      const search = cloudinary.search
        .expression("resource_type:image AND type:upload")
        .sort_by("created_at", "desc")
        .max_results(FILES_PER_PAGE) as CloudinarySearchQuery;

      if (cursor) {
        search.next_cursor(cursor);
      }

      result = await search.execute();

      if (page < currentPage) {
        if (!result.next_cursor) {
          currentPage = page;
          break;
        }

        cursor = result.next_cursor;
      }
    }

    // Guards against the loop never running (shouldn't happen since currentPage >= 1, but keeps TS happy)
    if (!result) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch files",
      });
      return;
    }

    const files: FormattedFile[] = formatFiles(result.resources);

    const totalFiles: number = result.total_count || 0;

    const totalPages: number = Math.ceil(totalFiles / FILES_PER_PAGE);

    // Redirect to the last page if the requested page is out of bounds
    if (totalPages > 0 && currentPage > totalPages) {
      res.redirect(`/gallery?page=${totalPages}`);
      return;
    }

    console.log(
      `[DONE] Retrieved ${files.length} files ` +
        `(page ${currentPage}/${totalPages}).`,
    );

    res.render("gallery", {
      files,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error("[ERROR] Error fetching files from Cloudinary:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
    });
  }
});

export default router;
