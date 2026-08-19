import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    createdAt TEXT DEFAULT (datetime('now'))
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

  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT DEFAULT '',
    slug TEXT UNIQUE NOT NULL
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
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

// Migration: add columns to existing tables
const cols = db.prepare("PRAGMA table_info(order_items)").all() as { name: string }[];
const has = (n: string) => cols.some(c => c.name === n);
if (!has("name")) db.exec("ALTER TABLE order_items ADD COLUMN name TEXT DEFAULT ''");
if (!has("image")) db.exec("ALTER TABLE order_items ADD COLUMN image TEXT DEFAULT ''");
const doCols = db.prepare("PRAGMA table_info(design_orders)").all() as { name: string }[];
const doHas = (n: string) => doCols.some(c => c.name === n);
if (!doHas("phone")) db.exec("ALTER TABLE design_orders ADD COLUMN phone TEXT DEFAULT ''");
const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
const userHas = (n: string) => userCols.some(c => c.name === n);
if (!userHas("password_changed_at")) db.exec("ALTER TABLE users ADD COLUMN password_changed_at INTEGER NOT NULL DEFAULT 0");
const designCols = db.prepare("PRAGMA table_info(designs)").all() as { name: string }[];
const designHas = (n: string) => designCols.some(c => c.name === n);
if (!designHas("category")) db.exec("ALTER TABLE designs ADD COLUMN category TEXT DEFAULT ''");

// Admin audit trail
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_audit (
    id TEXT PRIMARY KEY,
    adminId TEXT NOT NULL,
    adminEmail TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    details TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

// Designs (made-to-order gallery)
db.exec(`
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

export function logAdminAction(adminId: string, adminEmail: string, action: string, target: string, details = "") {
  db.prepare("INSERT INTO admin_audit (id, adminId, adminEmail, action, target, details) VALUES (?, ?, ?, ?, ?, ?)")
    .run(crypto.randomUUID(), adminId, adminEmail, action, target, String(details).slice(0, 500));
}

export const DESIGN_STATUSES = ["pending", "contacted", "in_production", "complete", "cancelled"] as const;

export default db;