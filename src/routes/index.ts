import { Application, Request, Response } from "express";
import cleanup from "./cleanup";
import deleteFile from "./delete";
import gallery from "./gallery";
import upload from "./upload";

export const routes = (app: Application): void => {
  app.use("/upload", upload);
  app.use("/delete", deleteFile);
  app.use("/gallery", gallery);
  app.use("/api/cleanup", cleanup);

  app.get("/", (req: Request, res: Response): void => {
    res.render("index");
  });
};
