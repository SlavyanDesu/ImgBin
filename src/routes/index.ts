import { Application, Request, Response } from "express";
import upload from "./upload";
import deleteFile from "./delete";
import gallery from "./gallery";

export const routes = (app: Application): void => {
  app.use("/upload", upload);
  app.use("/delete", deleteFile);
  app.use("/gallery", gallery);

  app.get("/", (req: Request, res: Response): void => {
    res.render("index");
  });
};
