import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import favicon from "serve-favicon";
import session from "express-session";
import uploadRouter from "./routes/upload";
import deleteRouter from "./routes/delete";
import filesRouter from "./routes/files";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(favicon(path.join(__dirname, "public", "/assets/favicon/favicon.ico")));
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/upload", uploadRouter);
app.use("/delete", deleteRouter);
app.use("/files", filesRouter);

app.get("/", (req: Request, res: Response) => res.render("index"));
app.get("/upload", (req: Request, res: Response) => res.render("upload"));

app.use((err: Error, req: Request, res: Response) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));