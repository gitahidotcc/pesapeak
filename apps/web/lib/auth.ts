import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import serverConfig from "@pesapeak/shared/config";

export const auth = betterAuth({
  database: new Database(serverConfig.dataDir + "/db.db"),
  emailAndPassword: {
    enabled: !serverConfig.auth.disablePasswordAuth,
    requireEmailVerification: serverConfig.auth.emailVerificationRequired,
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

export type Session = typeof auth.$Infer.Session;
