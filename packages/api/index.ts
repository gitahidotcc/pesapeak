import { Hono } from "hono";
import health from "./routes/health";
import trpc from "./routes/trpc";
import files from "./routes/files";

// Create a Hono app that can be mounted in the Next.js route handler
const app = new Hono()
  .route("/health", health)
  .route("/trpc", trpc)
  .route("/files", files);

export default app;

