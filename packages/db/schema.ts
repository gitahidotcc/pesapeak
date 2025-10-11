import { relations } from "drizzle-orm";
import {
  AnySQLiteColumn,
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";


function createdAtField() {
  return integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());
}

function modifiedAtField() {
  return integer("modifiedAt", { mode: "timestamp" })
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

  // User Settings
  timezone: text("timezone").default("UTC"),
});