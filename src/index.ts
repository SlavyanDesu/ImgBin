import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import dotenv from "dotenv"
import uploadRouter from "./routes/upload"
import deleteRouter from "./routes/delete"
import filesRouter from "./routes/files"
import path from "path"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

app.use("/upload", uploadRouter)
app.use("/delete", deleteRouter)
app.use("/files", filesRouter)

app.get("/", (req: Request, res: Response) => {
  res.render("index")
})

app.get("/upload", (req: Request, res: Response) => {
  res.render("upload")
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})