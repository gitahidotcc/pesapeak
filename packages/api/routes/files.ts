import { Hono } from "hono";
import fs from "node:fs/promises";
import path from "node:path";
import config from "@pesapeak/shared/config";
import type { Context } from "@pesapeak/trpc";

const files = new Hono<{
  Variables: {
    ctx: Context;
  };
}>();

// Serve transaction attachment files
// Path format: /api/files/transactions/{userId}/{filename}
files.get("/transactions/:userId/:filename", async (c) => {
  try {
    const userId = c.req.param("userId");
    const filename = c.req.param("filename");

    // Get context from middleware (set by nextAuth middleware in route.ts)
    const ctx = c.var.ctx;
    if (!ctx || !ctx.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Only allow users to access their own files
    if (ctx.user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Construct file path - files are stored as: dataDir/transactions/{userId}/{transactionId}.{ext}
    const filePath = path.join(config.dataDir, "transactions", userId, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return c.json({ error: "File not found" }, 404);
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);

    // Determine content type from file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".gif": "image/gif",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    // Return file with appropriate headers
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default files;

