import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import { z } from "zod";
import { SqliteError } from "@pesapeak/db";
import {
  users,
  verificationTokens,
} from "@pesapeak/db/schema";
import { deleteUserAssets } from "@pesapeak/shared/asset-db";
import serverConfig from "@pesapeak/shared/config";
import {
  zSignUpSchema,
  zUpdateUserSettingsSchema,
  zUserSettingsSchema,
  zWhoAmIResponseSchema,
} from "@pesapeak/shared/types/users";
import { AuthedContext, Context } from "..";
import { generatePasswordSalt, hashPassword, validatePassword } from "../auth";
import { sendVerificationEmail } from "../email";
import { PrivacyAware } from "./privacy";

export class User implements PrivacyAware {
  constructor(
    protected ctx: AuthedContext,
    public user: typeof users.$inferSelect,
  ) {}

  static async fromId_DANGEROUS(ctx: AuthedContext, id: string): Promise<User> {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return new User(ctx, user);
  }

  static async fromCtx(ctx: AuthedContext): Promise<User> {
    return this.fromId_DANGEROUS(ctx, ctx.user.id);
  }

  static async create(
    ctx: Context,
    input: z.infer<typeof zSignUpSchema>,
  ) {
    const salt = generatePasswordSalt();
    const user = await User.createRaw(ctx.db, {
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password, salt),
      salt,
    });

    if (serverConfig.auth.emailVerificationRequired) {
      const token = await User.genEmailVerificationToken(ctx.db, input.email);
      try {
        await sendVerificationEmail(input.email, input.name, token);
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    }

    return user;
  }

  static async createRaw(
    db: Context["db"],
    input: {
      name: string;
      email: string;
      password?: string;
      salt?: string;
      emailVerified?: Date | null;
    },
  ) {
      try {
      const [result] = await db
          .insert(users)
          .values({
            name: input.name,
            email: input.email,
            password: input.password,
            salt: input.salt,
            emailVerified: input.emailVerified,
          })
          .returning();

        return result;
      } catch (e) {
        if (e instanceof SqliteError) {
          if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Email is already taken",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
  }

  static async getAll(ctx: AuthedContext): Promise<User[]> {
    const dbUsers = await ctx.db.select().from(users);

    return dbUsers.map((u) => new User(ctx, u));
  }

  static async genEmailVerificationToken(
    db: Context["db"],
    email: string,
  ): Promise<string> {
    const token = randomBytes(10).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });

    return token;
  }

  static async verifyEmailToken(
    db: Context["db"],
    email: string,
    token: string,
  ): Promise<boolean> {
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: (vt, { and, eq }) =>
        and(eq(vt.identifier, email), eq(vt.token, token)),
    });

    if (!verificationToken) {
      return false;
    }

    if (verificationToken.expires < new Date()) {
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, email),
            eq(verificationTokens.token, token),
          ),
        );
      return false;
    }

    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, token),
        ),
      );

    return true;
  }

  static async verifyEmail(
    ctx: Context,
    email: string,
    token: string,
  ): Promise<void> {
    const isValid = await User.verifyEmailToken(ctx.db, email, token);
    if (!isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid or expired verification token",
      });
    }

    const result = await ctx.db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, email));

    if (result.changes === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
  }

  static async resendVerificationEmail(
    ctx: Context,
    email: string,
  ): Promise<void> {
    if (
      !serverConfig.auth.emailVerificationRequired ||
      !serverConfig.email.smtp
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email verification is not enabled",
      });
    }

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return; // Don't reveal if user exists or not for security
    }

    if (user.emailVerified) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email is already verified",
      });
    }

    const token = await User.genEmailVerificationToken(ctx.db, email);
    try {
      await sendVerificationEmail(email, user.name, token);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send verification email",
      });
    }
  }


  ensureCanAccess(ctx: AuthedContext): void {
    if (this.user.id !== ctx.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User is not allowed to access resource",
      });
    }
  }

  private static async deleteInternal(db: Context["db"], userId: string) {
    const res = await db.delete(users).where(eq(users.id, userId));

    if (res.changes === 0) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    await deleteUserAssets({ userId: userId });
  }

  async deleteAccount(password?: string): Promise<void> {
    invariant(this.ctx.user.email, "A user always has an email specified");

    if (this.user.password) {
      if (!password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password is required for local accounts",
        });
      }

      try {
        await validatePassword(this.ctx.user.email, password, this.ctx.db);
      } catch {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }
    }

    await User.deleteInternal(this.ctx.db, this.user.id);
  }


  async getSettings(): Promise<z.infer<typeof zUserSettingsSchema>> {
    const settings = await this.ctx.db.query.users.findFirst({
      where: eq(users.id, this.user.id),
      columns: {
        timezone: true,
      },
    });

    if (!settings) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User settings not found",
      });
    }

    return {
      timezone: settings.timezone || "UTC",
    };
  }

  async updateSettings(
    input: z.infer<typeof zUpdateUserSettingsSchema>,
  ): Promise<void> {
    if (Object.keys(input).length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No settings provided",
      });
    }

    await this.ctx.db
      .update(users)
      .set({
        timezone: input.timezone,
      })
      .where(eq(users.id, this.user.id));
  }



  asWhoAmI(): z.infer<typeof zWhoAmIResponseSchema> {
    return {
      id: this.user.id,
      name: this.user.name,
      email: this.user.email,
      localUser: this.user.password !== null,
    };
  }

  asPublicUser() {
    const { password, salt: _salt, ...rest } = this.user;
    return {
      ...rest,
      localUser: password !== null,
    };
  }
}
