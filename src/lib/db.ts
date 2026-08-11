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

export default db;