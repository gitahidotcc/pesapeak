import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import serverConfig from "@pesapeak/shared/config";
import { sendPasswordResetEmail } from "@pesapeak/trpc/email";

export const auth = betterAuth({
  database: new Database(serverConfig.dataDir + "/db.db"),
  emailAndPassword: {
    enabled: !serverConfig.auth.disablePasswordAuth,
    requireEmailVerification: serverConfig.auth.emailVerificationRequired,
    sendResetPassword: async ({ user, url, token }, request) => {
      if (!serverConfig.email.smtp) {
        throw new Error("SMTP is not configured");
      }
      
      // Use our existing email sending function with Better Auth's URL
      await sendPasswordResetEmail(user.email, user.name || "User", token, url);
    },
  },
  socialProviders: serverConfig.auth.oauth.clientId && serverConfig.auth.oauth.clientSecret ? {
    google: {
      clientId: serverConfig.auth.oauth.clientId,
      clientSecret: serverConfig.auth.oauth.clientSecret,
    },
  } : {},
  email: serverConfig.email.smtp ? {
    provider: "smtp",
    server: {
      host: serverConfig.email.smtp.host,
      port: serverConfig.email.smtp.port,
      secure: serverConfig.email.smtp.secure,
      auth: {
        user: serverConfig.email.smtp.user,
        pass: serverConfig.email.smtp.password,
      },
    },
    from: serverConfig.email.smtp.from,
  } : undefined,
  baseURL: serverConfig.publicUrl,
  trustedOrigins: [serverConfig.publicUrl],
  secret: serverConfig.signingSecret(),
  plugins: [
    nextCookies(), // Enable automatic cookie setting for server actions
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

// Default export for Better Auth CLI
export default auth;

export type Session = typeof auth.$Infer.Session;
