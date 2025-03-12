import { Application } from "express";
import { cookie } from "./cookie";
import { error } from "./error";

export const applyMiddlewares = (app: Application) => {
  app.use(cookie);
  app.use(error);
};
