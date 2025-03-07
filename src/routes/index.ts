import { Application, Request, Response } from "express";
import upload from "./upload";
import deleteFile from "./delete";
import files from "./files";

export const routes = (app: Application): void => {
  app.use("/upload", upload);
  app.use("/delete", deleteFile);
  app.use("/files", files);

  app.get("/", (req: Request, res: Response): void => {
    res.render("index");
  });
};
