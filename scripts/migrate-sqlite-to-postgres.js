const Database = require("better-sqlite3");
const { Client } = require("pg");
const path = require("path");
const {
  assertEncryptionKeyConfigured,
  decryptSensitiveData,
  emailLookup,
  encryptSensitiveData,
} = require("../src/lib/sensitive-data.js");

const SENSITIVE_COLUMNS = {
  users: new Set(["name", "email"]),
  orders: new Set(["email", "firstname", "lastname", "address", "city", "zip", "country"]),
  design_orders: new Set(["dimensions", "notes", "customername", "email", "phone"]),
  contacts: new Set(["firstname", "lastname", "email", "message"]),
  subscribers: new Set(["email"]),
  admin_audit: new Set(["adminemail"]),
};
const EMAIL_LOOKUP_TABLES = new Set(["users", "subscribers"]);

const TABLES = {
  users: [
    ["id", "id"], ["name", "name"], ["email", "email"], ["email_lookup", "email_lookup"], ["password", "password"],
    ["role", "role"], ["createdAt", "createdat"],
    ["password_changed_at", "password_changed_at"], ["reset_token_hash", "reset_token_hash"],
    ["reset_token_expires_at", "reset_token_expires_at"],
  ],
  products: [
    ["id", "id"], ["name", "name"], ["slug", "slug"], ["description", "description"],
    ["price", "price"], ["image", "image"], ["category", "category"], ["sizes", "sizes"],
    ["colors", "colors"], ["featured", "featured"], ["createdAt", "createdat"],
  ],
  blog_posts: [
    ["id", "id"], ["title", "title"], ["slug", "slug"], ["excerpt", "excerpt"],
    ["content", "content"], ["image", "image"], ["author", "author"], ["date", "date"],
    ["tags", "tags"],
  ],
  designs: [
    ["id", "id"], ["name", "name"], ["slug", "slug"], ["description", "description"],
    ["price", "price"], ["sizePrices", "sizeprices"], ["image", "image"],
    ["category", "category"], ["tags", "tags"], ["active", "active"], ["createdAt", "createdat"],
  ],
  orders: [
    ["id", "id"], ["userId", "userid"], ["email", "email"], ["firstName", "firstname"],
    ["lastName", "lastname"], ["address", "address"], ["city", "city"], ["zip", "zip"],
    ["country", "country"], ["status", "status"], ["total", "total"], ["createdAt", "createdat"],
  ],
  order_items: [
    ["id", "id"], ["orderId", "orderid"], ["productId", "productid"], ["name", "name"],
    ["quantity", "quantity"], ["size", "size"], ["color", "color"], ["price", "price"],
    ["image", "image"],
  ],
  design_orders: [
    ["id", "id"], ["designId", "designid"], ["designName", "designname"], ["size", "size"],
    ["price", "price"], ["quantity", "quantity"], ["fabric", "fabric"], ["color", "color"],
    ["dimensions", "dimensions"], ["notes", "notes"], ["customerName", "customername"],
    ["email", "email"], ["phone", "phone"], ["status", "status"], ["createdAt", "createdat"],
  ],
  contacts: [
    ["id", "id"], ["firstName", "firstname"], ["lastName", "lastname"], ["email", "email"],
    ["message", "message"], ["createdAt", "createdat"],
  ],
  subscribers: [
    ["id", "id"], ["email", "email"], ["email_lookup", "email_lookup"], ["createdAt", "createdat"],
  ],
  rate_limit_buckets: [
    ["key", "key"], ["timestamps", "timestamps"], ["failures", "failures"],
    ["lockedUntil", "lockeduntil"], ["updatedAt", "updatedat"],
  ],
  admin_audit: [
    ["id", "id"], ["adminId", "adminid"], ["adminEmail", "adminemail"], ["action", "action"],
    ["target", "target"], ["details", "details"], ["createdAt", "createdat"],
  ],
};

async function main() {
  assertEncryptionKeyConfigured();
  const migrationUrl = process.env.SUPABASE_MIGRATION_DATABASE_URL;
  if (!migrationUrl) {
    throw new Error("SUPABASE_MIGRATION_DATABASE_URL is required for the one-time data import.");
  }

  const sqlitePath = process.env.SQLITE_DATABASE_PATH || path.join(process.cwd(), "prisma", "dev.db");
  const source = new Database(sqlitePath, { readonly: true, fileMustExist: true });
  const target = new Client({
    connectionString: migrationUrl,
    ssl: { rejectUnauthorized: true },
  });
  let connected = false;
  let transactionStarted = false;

  try {
    await target.connect();
    connected = true;
    await target.query("BEGIN");
    transactionStarted = true;

    for (const [table, columns] of Object.entries(TABLES)) {
      const { rows: targetRows } = await target.query(`SELECT COUNT(*)::bigint AS count FROM public.${table}`);
      if (Number(targetRows[0].count) !== 0) {
        throw new Error(`Target table ${table} is not empty; refusing to import over existing data.`);
      }

      const sourceRows = source.prepare(`SELECT * FROM "${table}"`).all();
      const importableColumns = columns.filter(([sourceColumn, targetColumn]) =>
        targetColumn === "email_lookup" && EMAIL_LOOKUP_TABLES.has(table)
          ? true
          : sourceRows.length === 0 || Object.hasOwn(sourceRows[0], sourceColumn),
      );

      for (const row of sourceRows) {
        const values = importableColumns.map(([sourceColumn, targetColumn]) => {
          if (targetColumn === "email_lookup" && EMAIL_LOOKUP_TABLES.has(table)) {
            return emailLookup(decryptSensitiveData(row.email), table);
          }
          const value = row[sourceColumn];
          return SENSITIVE_COLUMNS[table]?.has(sourceColumn.toLowerCase())
            ? encryptSensitiveData(decryptSensitiveData(value))
            : value;
        });
        const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
        const targetColumns = importableColumns.map(([, targetColumn]) => targetColumn).join(", ");
        await target.query(
          `INSERT INTO public.${table} (${targetColumns}) VALUES (${placeholders})`,
          values,
        );
      }

      const { rows: importedRows } = await target.query(`SELECT COUNT(*)::bigint AS count FROM public.${table}`);
      if (Number(importedRows[0].count) !== sourceRows.length) {
        throw new Error(`Row count mismatch while importing ${table}.`);
      }
      console.log(`Imported ${sourceRows.length} rows from ${table}.`);
    }

    await target.query("COMMIT");
    transactionStarted = false;
    console.log("SQLite data import completed.");
  } catch (error) {
    if (connected && transactionStarted) {
      await target.query("ROLLBACK");
    }
    throw error;
  } finally {
    source.close();
    if (connected) await target.end();
  }
}

main().catch(error => {
  console.error("SQLite to PostgreSQL migration failed:", error.message);
  process.exitCode = 1;
});
