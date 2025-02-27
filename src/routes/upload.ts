import express from "express"
import multer from "multer"
import path from "path"
import cloudinary from "../config/cloudinary"

const router = express.Router() 
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB Max
})

router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" })
      return
    }

    console.log("Fetching file details for:", req.file.originalname)
    console.log("Uploading...")

    const fileExt = path.extname(req.file.originalname)
    const fileNameWithoutExt = req.file.originalname.replace(fileExt, "")
    const uniqueFilename = `${Date.now()}-${encodeURIComponent(fileNameWithoutExt)}`

    cloudinary.uploader.upload_stream(
      { resource_type: "auto", public_id: uniqueFilename },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error)
          return res.status(500).json({ message: "Upload failed" })
        }

        console.log("Successfully uploaded!")

        res.json({
          url: result?.secure_url,
          publicId: result?.public_id,
        })
      }
    ).end(req.file.buffer)
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router