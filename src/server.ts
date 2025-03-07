import express, { Application } from "express";
import dotenv from "dotenv";
import { config, cookie, error } from "./middlewares";
import { routes } from "./routes";

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

const start = (): void => {
  config(app);
  app.use(cookie);
  routes(app);
  app.use(error);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();
