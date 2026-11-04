import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import Database from "better-sqlite3";
import { Pool, type PoolClient } from "pg";
import path from "path";
import { assertEncryptionKeyConfigured, encryptSensitiveData } from "@/lib/encryption";

export type DatabaseRole = "public" | "auth" | "customer" | "admin" | "system";
export interface DatabaseContext {
  userId?: string;
  role: DatabaseRole;
}

interface DatabaseScope {
  driver: "postgres" | "sqlite";
  client?: PoolClient;
}

interface QueryResult<Row> {
  rows: Row[];
  changes: number;
}

const scopeStorage = new AsyncLocalStorage<DatabaseScope>();
const databaseUrl = process.env.DATABASE_URL;

const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

if (process.env.NODE_ENV === "production" && !databaseUrl && !isProductionBuild) {
  throw new Error("DATABASE_URL is required in production.");
}
if (process.env.NODE_ENV === "production" && !isProductionBuild) {
  assertEncryptionKeyConfigured();
}

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: true },
    })
  : null;

pool?.on("error", error => {
  console.error("[database] Unexpected PostgreSQL pool error.", error);
});

const sqlite = pool
  ? null
  : new Database(path.join(process.cwd(), "prisma", "dev.db"));

if (sqlite) {
  sqlite.pragma("journal_mode = WAL");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      email_lookup TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      createdAt TEXT DEFAULT (datetime('now')),
      reset_token_hash TEXT,
      reset_token_expires_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT DEFAULT '',
      category TEXT NOT NULL,
      sizes TEXT DEFAULT 'S,M,L,XL',
      colors TEXT DEFAULT 'Black',
      featured INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT,
      email TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      zip TEXT NOT NULL,
      country TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      total REAL NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      name TEXT DEFAULT '',
      quantity INTEGER NOT NULL,
      size TEXT NOT NULL,
      color TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT DEFAULT '',
      author TEXT NOT NULL,
      date TEXT NOT NULL,
      tags TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      email_lookup TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS rate_limit_buckets (
      key TEXT PRIMARY KEY,
      timestamps TEXT NOT NULL,
      failures INTEGER NOT NULL DEFAULT 0,
      lockedUntil INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admin_audit (
      id TEXT PRIMARY KEY,
      adminId TEXT NOT NULL,
      adminEmail TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      details TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS designs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      sizePrices TEXT DEFAULT '{}',
      image TEXT DEFAULT '',
      category TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS design_orders (
      id TEXT PRIMARY KEY,
      designId TEXT NOT NULL,
      designName TEXT NOT NULL,
      size TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      fabric TEXT DEFAULT '',
      color TEXT DEFAULT '',
      dimensions TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  const columns = (table: string) =>
    sqlite!.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  const hasColumn = (table: string, name: string) => columns(table).some(column => column.name === name);
  if (!hasColumn("order_items", "name")) sqlite.exec("ALTER TABLE order_items ADD COLUMN name TEXT DEFAULT ''");
  if (!hasColumn("order_items", "image")) sqlite.exec("ALTER TABLE order_items ADD COLUMN image TEXT DEFAULT ''");
  if (!hasColumn("design_orders", "phone")) sqlite.exec("ALTER TABLE design_orders ADD COLUMN phone TEXT DEFAULT ''");
  if (!hasColumn("users", "password_changed_at")) sqlite.exec("ALTER TABLE users ADD COLUMN password_changed_at INTEGER NOT NULL DEFAULT 0");
  if (!hasColumn("users", "email_lookup")) sqlite.exec("ALTER TABLE users ADD COLUMN email_lookup TEXT");
  if (!hasColumn("subscribers", "email_lookup")) sqlite.exec("ALTER TABLE subscribers ADD COLUMN email_lookup TEXT");
  if (!hasColumn("users", "reset_token_hash")) sqlite.exec("ALTER TABLE users ADD COLUMN reset_token_hash TEXT");
  if (!hasColumn("users", "reset_token_expires_at")) sqlite.exec("ALTER TABLE users ADD COLUMN reset_token_expires_at INTEGER");
  if (!hasColumn("designs", "category")) sqlite.exec("ALTER TABLE designs ADD COLUMN category TEXT DEFAULT ''");
  sqlite.exec("CREATE UNIQUE INDEX IF NOT EXISTS users_email_lookup_unique ON users (email_lookup)");
  sqlite.exec("CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_lookup_unique ON subscribers (email_lookup)");
}

const fieldNames: Record<string, string> = {
  adminemail: "adminEmail",
  adminid: "adminId",
  createdat: "createdAt",
  customername: "customerName",
  designid: "designId",
  firstname: "firstName",
  lastname: "lastName",
  lockeduntil: "lockedUntil",
  orderid: "orderId",
  productid: "productId",
  sizeprices: "sizePrices",
  updatedat: "updatedAt",
  userid: "userId",
};

function normalizeRow<Row extends Record<string, unknown>>(row: Row): Row {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[fieldNames[key.toLowerCase()] ?? key] = value;
  }
  return normalized as Row;
}

function postgresPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

async function run<Row extends Record<string, unknown>>(
  sql: string,
  values: unknown[] = [],
): Promise<QueryResult<Row>> {
  const scope = scopeStorage.getStore();
  if (pool) {
    if (!scope?.client) {
      return withDatabaseContext({ role: "public" }, () => run<Row>(sql, values));
    }
    const result = await scope.client.query(postgresPlaceholders(sql), values);
    return {
      rows: result.rows.map(normalizeRow) as Row[],
      changes: result.rowCount ?? 0,
    };
  }

  if (!sqlite) throw new Error("The database driver is not initialized.");
  const statement = sqlite.prepare(sql);
  if (/^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql)) {
    const rows = statement.all(...values) as Row[];
    return { rows: rows.map(normalizeRow), changes: rows.length };
  }
  const result = statement.run(...values);
  return { rows: [], changes: result.changes };
}

export async function withDatabaseContext<T>(
  context: DatabaseContext,
  callback: () => Promise<T>,
): Promise<T> {
  const existingScope = scopeStorage.getStore();
  if (existingScope) return callback();

  if (pool) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "SELECT set_config('app.user_id', $1, true), set_config('app.user_role', $2, true)",
        [context.userId ?? "", context.role],
      );
      const result = await scopeStorage.run({ driver: "postgres", client }, callback);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return scopeStorage.run({ driver: "sqlite" }, callback);
}

export async function withDatabaseTransaction<T>(
  context: DatabaseContext,
  callback: () => Promise<T>,
): Promise<T> {
  if (scopeStorage.getStore()) return callback();

  if (pool) return withDatabaseContext(context, callback);
  if (!sqlite) throw new Error("The database driver is not initialized.");

  sqlite.exec("BEGIN IMMEDIATE");
  try {
    const result = await scopeStorage.run({ driver: "sqlite" }, callback);
    sqlite.exec("COMMIT");
    return result;
  } catch (error) {
    sqlite.exec("ROLLBACK");
    throw error;
  }
}

export async function lockDatabaseKey(key: string): Promise<void> {
  const scope = scopeStorage.getStore();
  if (pool && scope?.client) {
    await scope.client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
  }
}

const db = {
  prepare(sql: string) {
    return {
      async all<Row extends Record<string, unknown> = Record<string, unknown>>(...values: unknown[]) {
        return (await run<Row>(sql, values)).rows;
      },
      async get<Row extends Record<string, unknown> = Record<string, unknown>>(...values: unknown[]) {
        return (await run<Row>(sql, values)).rows[0];
      },
      async run(...values: unknown[]) {
        const result = await run(sql, values);
        return { changes: result.changes };
      },
    };
  },
};

export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  target: string,
  details = "",
) {
  await withDatabaseContext({ userId: adminId, role: "admin" }, () =>
    db.prepare(
      "INSERT INTO admin_audit (id, adminId, adminEmail, action, target, details) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(crypto.randomUUID(), adminId, encryptSensitiveData(adminEmail), action, target, String(details).slice(0, 500)),
  );
}

export const DESIGN_STATUSES = ["pending", "contacted", "in_production", "complete", "cancelled"] as const;

export default db;
