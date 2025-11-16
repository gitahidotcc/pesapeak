import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@pesapeak/trpc/routers/_app";
import type { Context } from "@pesapeak/trpc";

const trpc = new Hono<{
  Variables: {
    ctx: Context;
  };
}>().use(
  "/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext: (_, c) => {
      return c.var.ctx;
    },
    onError: ({ path, error }) => {
      if (process.env.NODE_ENV === "development") {
        console.error(`❌ tRPC failed on ${path}`);
      }
      console.error(error);
    },
  }),
);

export default trpc;

