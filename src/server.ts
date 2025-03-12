import express, { Application } from "express";
import { applyMiddlewares } from "./middlewares";
import { routes } from "./routes";
import { PORT } from "./config/serverConfig";
import { configureServer } from "./config/serverConfig";

const app: Application = express();

const start = (): void => {
  configureServer(app);
  applyMiddlewares(app);
  routes(app);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on  http://localhost:${PORT}`);
  });
};

start();
