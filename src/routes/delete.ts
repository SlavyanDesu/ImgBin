import express, { Request, Response } from "express"
import cloudinary from "../config/cloudinary"

const router = express.Router()

router.delete("/:publicId", async (req: Request, res: Response) => {
  try {
    const { publicId }= req.params
    console.log(req.params)

    console.log("Fetching file details for:", publicId)

    const fileInfo = await cloudinary.api.resource(publicId)

    if (!fileInfo) {
      res.status(404).json({ message: "File not found" })
      return
    }

    console.log("Deleting:", publicId)

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result !== "ok") {
      res.status(400).json({ message: "Failed to delete file" })
      return
    }

    console.log("Deleted!")
    res.json({ success: true, message: "File deleted successfully" })
  } catch (err) {
    console.error("Delete error:", err)
    res.status(500).json({ message: "Internal server error" })
    return
  }
})

export default router 