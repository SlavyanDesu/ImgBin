import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import uploadRouter from "./routes/upload";
import deleteRouter from "./routes/delete";
import filesRouter from "./routes/files";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/upload", uploadRouter);
app.use("/delete", deleteRouter);
app.use("/files", filesRouter);

app.get("/", (req: Request, res: Response) => res.render("index"));
app.get("/upload", (req: Request, res: Response) => res.render("upload"));

// Centralized error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));