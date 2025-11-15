import { headers } from "next/headers";
import { getServerAuthSession } from "@/server/auth";
import requestIp from "request-ip";
import { eq } from "drizzle-orm";

import { db } from "@pesapeak/db";
import { users } from "@pesapeak/db/schema";
import { Context } from "@pesapeak/trpc";
import { authenticateApiKey } from "@pesapeak/trpc/auth";

export async function createContextFromRequest(req: Request) {
  // TODO: This is a hack until we offer a proper REST API instead of the trpc based one.
  // Check if the request has an Authorization token, if it does, assume that API key authentication is requested.
  const ip = requestIp.getClientIp({
    headers: Object.fromEntries(req.headers.entries()),
  });
  const authorizationHeader = req.headers.get("Authorization");
  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    const token = authorizationHeader.split(" ")[1];
    try {
      const user = await authenticateApiKey(token, db);
      return {
        user,
        db,
        req: {
          ip,
        },
      };
    } catch {
      // Fallthrough to cookie-based auth
    }
  }

  return createContext(db, ip);
}

export const createContext = async (
  database?: typeof db,
  ip?: string | null,
): Promise<Context> => {
  const session = await getServerAuthSession();
  if (ip === undefined) {
    const hdrs = await headers();
    ip = requestIp.getClientIp({
      headers: Object.fromEntries(hdrs.entries()),
    });
  }
  
  let user: Context["user"] = null;
  if (session?.user) {
    // Fetch user from database to get the role
    const dbUser = await (database ?? db)
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
    
    if (dbUser) {
      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role ?? null,
      };
    }
  }
  
  return {
    user,
    db: database ?? db,
    req: {
      ip,
    },
  };
};
