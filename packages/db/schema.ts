import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";


function createdAtField() {
  return integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());
}

function updatedAtField() {
  return integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());
}




export const users = sqliteTable("user", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  password: text("password"),
  salt: text("salt").notNull().default(""),
  role: text("role", { enum: ["admin", "user"] }).default("user"),
  createdAt: createdAtField(),
  updatedAt: updatedAtField(),

  // User Settings
  timezone: text("timezone").default("UTC"),
  language: text("language").default("en"),
  isOnboarded: integer("isOnboarded", { mode: "boolean" }).default(false),
  onboardingStep: integer("onboardingStep").default(0),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

export const passwordResetTokens = sqliteTable(
  "passwordResetToken",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAtField(),
  },
  (prt) => [index("passwordResetTokens_userId_idx").on(prt.userId)],
);


// Better Auth tables
export const sessions = sqliteTable("session", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: createdAtField(),
  updatedAt: updatedAtField(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
});

export const accounts = sqliteTable("account", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp_ms" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: createdAtField(),
  updatedAt: updatedAtField(),
});


// API Keys
export const apiKeys = sqliteTable(
  "apiKey",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    createdAt: createdAtField(),
    keyId: text("keyId").notNull().unique(),
    keyHash: text("keyHash").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (ak) => [unique().on(ak.name, ak.userId)],
);

// Financial Accounts
export const financialAccounts = sqliteTable(
  "financialAccount",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    accountType: text("accountType").notNull(),
    currency: text("currency").notNull().default("USD"),
    color: text("color").notNull().default("#222222"),
    icon: text("icon").notNull().default("bank"),
    notes: text("notes").default(""),
    initialBalance: integer("initialBalance").default(0),
    totalBalance: integer("totalBalance").default(0),
    defaultAccount: integer("defaultAccount", { mode: "boolean" }).default(false),
    createdAt: createdAtField(),
    updatedAt: updatedAtField(),
  },
  (table) => ({
    // Unique constraint: only one default account per user
    uniqueDefaultPerUser: uniqueIndex("unique_default_per_user")
      .on(table.userId, table.defaultAccount)
      .where(sql`${table.defaultAccount} = 1`),
  })
);

export const verifications = sqliteTable("verification", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  createdAt: createdAtField(),
  updatedAt: updatedAtField(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  passwordResetTokens: many(passwordResetTokens),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const financialAccountsRelations = relations(financialAccounts, ({ one }) => ({
  user: one(users, {
    fields: [financialAccounts.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Category Folders
export const categoryFolders = sqliteTable(
  "categoryFolder",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("banknote"),
    color: text("color").notNull().default("#222222"),
    createdAt: createdAtField(),
    updatedAt: updatedAtField(),
  },
  (table) => ({
    userIdIdx: index("categoryFolders_userId_idx").on(table.userId),
  })
);

// Categories
export const categories = sqliteTable(
  "category",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    folderId: text("folderId")
      .notNull()
      .references(() => categoryFolders.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("banknote"),
  color: text("color").notNull().default("#222222"),
  createdAt: createdAtField(),
    updatedAt: updatedAtField(),
  },
  (table) => ({
    userIdIdx: index("categories_userId_idx").on(table.userId),
    folderIdIdx: index("categories_folderId_idx").on(table.folderId),
  })
);

// Relations for categories
export const categoryFoldersRelations = relations(categoryFolders, ({ one, many }) => ({
  user: one(users, {
    fields: [categoryFolders.userId],
    references: [users.id],
  }),
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  folder: one(categoryFolders, {
    fields: [categories.folderId],
    references: [categoryFolders.id],
  }),
}));

