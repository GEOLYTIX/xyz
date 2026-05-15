import express from "express";
import { createXyzMiddleware } from "./apps/xyz/xyzFactory";
import { validateRequestAuth } from "./apps/xyz/mod/middleware/validateRequestAuth.js";

const app = express();
app.disable("x-powered-by");

const xyz = createXyzMiddleware([validateRequestAuth]);
app.use(xyz);

if (!process.env.VERCEL) {
  app.listen(xyzEnv.PORT);
}

export default app;
