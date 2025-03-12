import path from "path";
import cors from "cors";
import favicon from "serve-favicon";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const MODERATION_METHOD = process.env.MODERATION;
const PORT = parseInt(process.env.PORT || "3000", 10);

const configureServer = (app: Application): void => {
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../views"));
  app.set("trust proxy", true);

  app.use(
    favicon(path.join(__dirname, "../public/assets/favicon/favicon.ico")),
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
  app.use(express.static(path.join(__dirname, "../public")));
};

export { MODERATION_METHOD, PORT, configureServer };
