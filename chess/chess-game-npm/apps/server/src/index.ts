import app from "./app.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env.PORT ?? 8080);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, `Chess API server listening on http://localhost:${port}`);
});
