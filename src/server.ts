import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import favicon from "serve-favicon";
import cookieParser from "cookie-parser";
import { cookie, error } from "./middlewares";
import { routes } from "./routes";

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

const start = (): void => {
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  app.set("trust proxy", true);

  app.use(
    favicon(path.join(__dirname, "public", "/assets/favicon/favicon.ico")),
  );

  app.use(
    cors({
      origin: "https://tempstorage.vercel.app",
      credentials: true,
    }),
  );

  app.use(cookieParser());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static(path.join(__dirname, "public")));

  app.use(cookie);
  routes(app);
  app.use(error);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();
