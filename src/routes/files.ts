import express from "express"
import { ResourceApiResponse } from "cloudinary"
import cloudinary from "../config/cloudinary"

const router = express.Router()

router.get("/",  async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      max_results: 10,
    })

    const files = result.resources.map((file: ResourceApiResponse["resources"][0]) => ({
      filename: file.public_id,
      size: file.bytes,
      dateUploaded: file.created_at,
      thumbnailUrl: file.secure_url.replace("/upload/", "/upload/c_thumb,w_200,h_200/"), // Generate thumbnail
      downloadUrl: file.secure_url, // Direct download URL  
    }))

    res.render("files", { files })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to fetch files" })
  }
})

export default router