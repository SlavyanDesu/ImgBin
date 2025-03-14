import express from "express";
import { applyMiddlewares } from "./middlewares";
import { routes } from "./routes";
import { PORT } from "./configs/serverConfig";
import { configureServer } from "./configs/serverConfig";

const app = express();

app.set("view engine", "ejs");

configureServer(app);
applyMiddlewares(app);
routes(app);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
