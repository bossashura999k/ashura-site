import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();
app.set("trust proxy", 1);   // ← you already added this

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- NEW: Serve built frontend static files ----
// ... after cookieParser etc.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "..", "..", "apps", "web", "dist");

app.use(express.static(distPath));
app.use("/api", router);                     // API routes first
app.get("/*", (_req: Request, res: Response) => {   // then SPA fallback
  res.sendFile(path.join(distPath, "index.html"));
});
// ------------------------------------------------

export default app;