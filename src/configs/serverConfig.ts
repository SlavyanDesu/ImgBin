import path from "path";
import cors from "cors";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const MODERATION_METHOD = process.env.MODERATION;
const PORT = parseInt(process.env.PORT || "3000", 10);

const isProd = process.env.NODE_ENV === "production";
const baseDir = isProd
  ? path.dirname(__dirname)
  : path.resolve(__dirname, "../");

const getGCPCredentials = () => {
  // For vercel deployment
  return process.env.GCP_PRIVATE_KEY
    ? {
        credentials: {
          client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY,
        },
        projectId: process.env.GCP_PROJECT_ID,
      }
    : {};
};

const configureServer = (app: Application): void => {
  app.set("views", path.join(baseDir, "views"));
  app.set("trust proxy", true);

  app.use(
    "/favicon.ico",
    express.static(path.join(baseDir, "public/assets/favicon/favicon.ico")),
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
  app.use(express.static(path.join(baseDir, "public")));
};

export { MODERATION_METHOD, PORT, getGCPCredentials, configureServer };
