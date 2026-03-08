import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { db } from "./drizzle";
import dbConfig from "./drizzle.config";

type TableColumn = {
  name: string;
};

function ensureLegacyLocationColumns() {
  const sqlite = new Database(dbConfig.dbCredentials.url);

  try {
    const transactionTable = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'transaction'"
      )
      .get();

    if (!transactionTable) {
      return;
    }

    const existingColumns = new Set(
      (sqlite.prepare("PRAGMA table_info(\"transaction\")").all() as TableColumn[]).map(
        (column) => column.name
      )
    );

    if (!existingColumns.has("locationName")) {
      sqlite.exec('ALTER TABLE "transaction" ADD COLUMN "locationName" text;');
    }

    if (!existingColumns.has("latitude")) {
      sqlite.exec('ALTER TABLE "transaction" ADD COLUMN "latitude" real;');
    }

    if (!existingColumns.has("longitude")) {
      sqlite.exec('ALTER TABLE "transaction" ADD COLUMN "longitude" real;');
    }

    sqlite.exec(
      'CREATE INDEX IF NOT EXISTS "transactions_locationName_idx" ON "transaction" ("locationName");'
    );
  } finally {
    sqlite.close();
  }
}

migrate(db, { migrationsFolder: "./drizzle" });
ensureLegacyLocationColumns();
