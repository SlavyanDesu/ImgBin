import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { configureServer, PORT } from "./configs/serverConfig";
import { applyMiddlewares } from "./middlewares";
import { routes } from "./routes";

const app = express();

app.set("view engine", "ejs");

configureServer(app);
applyMiddlewares(app);
routes(app);

// Start the server only if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
