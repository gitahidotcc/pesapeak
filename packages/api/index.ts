import { Hono } from "hono";
import health from "./routes/health";
import trpc from "./routes/trpc";

// Create a Hono app that can be mounted in the Next.js route handler
const app = new Hono()
  .route("/health", health)
  .route("/trpc", trpc);

export default app;

