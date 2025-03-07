import express from "express";
import cors from "cors";
import path from "path";
import favicon from "serve-favicon";
import cookieParser from "cookie-parser";

export const config = (app: express.Application): void => {
  app.use(
    favicon(path.join(__dirname, "../public", "/assets/favicon/favicon.ico")),
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

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../views"));

  app.set("trust proxy", true);
};
