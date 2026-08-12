const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new Database(dbPath);

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
    quantity INTEGER NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price REAL NOT NULL
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
`);

const upsert = (table, cols, row) => {
  const placeholders = cols.map(() => "?").join(",");
  const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`;
  db.prepare(sql).run(...cols.map((c) => row[c]));
};

const ID = (n) => String(n);

function getSeedAdminPassword() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (typeof password !== "string" || password.length < 12) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be set to a password of at least 12 characters before creating the initial admin user."
    );
  }
  return password;
}

// Admin user — only created if missing; never overwrites an existing admin
const adminEmail = "admin@kstyles.com";
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!existingAdmin) {
  const adminPassword = getSeedAdminPassword();
  upsert(
    "users",
    ["id", "name", "email", "password", "role"],
    {
      id: "admin-1",
      name: "Admin",
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 10),
      role: "admin",
    }
  );
  console.log("Admin user created.");
} else {
  console.log("Admin user already exists — password left unchanged.");
}

// Products
const products = [
  {
    id: ID(1), name: "Oversized Denim Jacket", slug: "oversized-denim-jacket",
    description: "Premium oversized denim jacket with gold-toned hardware. Crafted from heavyweight Japanese denim for durability and style.",
    price: 289, image: "https://images.unsplash.com/photo-1549277513-f1b32fe1f8f5?auto=format&fit=crop&w=900&q=80",
    category: "outerwear", sizes: "S,M,L,XL", colors: "Indigo,Black", featured: 1,
  },
  {
    id: ID(2), name: "Signature Hoodie", slug: "signature-hoodie",
    description: "Heavyweight cotton hoodie with embroidered Kstyles logo. Fleece-lined for maximum comfort.",
    price: 149, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    category: "tops", sizes: "S,M,L,XL,XXL", colors: "Black,Cream,Olive", featured: 1,
  },
  {
    id: ID(3), name: "Cargo Pants", slug: "cargo-pants",
    description: "Modern cargo pants with a tailored fit. Features multiple pockets and adjustable cuffs.",
    price: 179, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    category: "bottoms", sizes: "28,30,32,34,36", colors: "Black,Khaki,Grey", featured: 1,
  },
  {
    id: ID(4), name: "Leather Bomber Jacket", slug: "leather-bomber-jacket",
    description: "Genuine leather bomber jacket with satin lining. A timeless piece with a modern edge.",
    price: 459, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
    category: "outerwear", sizes: "S,M,L,XL", colors: "Black,Brown", featured: 1,
  },
  {
    id: ID(5), name: "Graphic Tee", slug: "graphic-tee",
    description: "100% organic cotton tee with signature Kstyles graphic print. Pre-shrunk for lasting fit.",
    price: 69, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    category: "tops", sizes: "S,M,L,XL,XXL", colors: "Black,White", featured: 0,
  },
  {
    id: ID(6), name: "Wide Leg Trousers", slug: "wide-leg-trousers",
    description: "Wide leg trousers in premium wool-blend fabric. Perfect for elevated streetwear looks.",
    price: 219, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    category: "bottoms", sizes: "28,30,32,34,36", colors: "Black,Navy,Charcoal", featured: 0,
  },
];
for (const p of products) upsert("products", Object.keys(p), p);

// Collections
const collections = [
  { id: ID(1), name: "Fall/Winter 2025", description: "Embrace the cold with our latest drop. Heavy fabrics, dark tones, and bold silhouettes.", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80", slug: "fall-winter-2025" },
  { id: ID(2), name: "Gold Label", description: "Our premium line featuring exclusive pieces with gold detailing and limited runs.", image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=900&q=80", slug: "gold-label" },
  { id: ID(3), name: "Essentials", description: "Wardrobe staples reimagined. Elevated basics for everyday luxury.", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80", slug: "essentials" },
];
for (const c of collections) upsert("collections", Object.keys(c), c);

// Blog posts
const blogPosts = [
  { id: ID(1), title: "The Art of Layering: Winter Style Guide", slug: "art-of-layering-winter-style-guide", excerpt: "Master the art of layering with Kstyles' top picks for the cold season.", content: "Layering is not just about staying warm—it's about making a statement. Start with a lightweight base like our Graphic Tee, add a mid-layer such as the Signature Hoodie, and top it off with the Oversized Denim Jacket or Leather Bomber. The key is mixing textures and proportions while keeping a cohesive color palette.", image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80", author: "Kstyles Team", date: "2025-12-20", tags: "style-guide,winter,layering" },
  { id: ID(2), title: "Behind the Design: Gold Label Collection", slug: "behind-the-design-gold-label-collection", excerpt: "An exclusive look at the inspiration and craftsmanship behind our Gold Label line.", content: "The Gold Label collection represents the pinnacle of Kstyles craftsmanship. Each piece undergoes a meticulous design process, from sketching to prototyping. We source premium materials from around the world—Italian leather, Japanese denim, and Egyptian cotton—to ensure unparalleled quality.", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=900&q=80", author: "Kstyles Team", date: "2025-11-30", tags: "behind-the-scenes,gold-label,craftsmanship" },
  { id: ID(3), title: "How to Style Cargo Pants for Any Occasion", slug: "how-to-style-cargo-pants", excerpt: "From casual to dressed-up, here's how to make cargo pants work for you.", content: "Cargo pants have made a major comeback. For a casual look, pair our Cargo Pants with the Signature Hoodie and clean sneakers. To dress them up, swap the hoodie for a fitted turtleneck and add the Leather Bomber Jacket. The versatility of cargo pants makes them a must-have in any wardrobe.", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80", author: "Kstyles Team", date: "2025-11-15", tags: "style-guide,cargo-pants,styling" },
];
for (const p of blogPosts) upsert("blog_posts", Object.keys(p), p);

console.log("Seed complete!");
console.log("  users:", db.prepare("SELECT COUNT(*) c FROM users").get().c);
console.log("  products:", db.prepare("SELECT COUNT(*) c FROM products").get().c);
console.log("  collections:", db.prepare("SELECT COUNT(*) c FROM collections").get().c);
console.log("  blog_posts:", db.prepare("SELECT COUNT(*) c FROM blog_posts").get().c);
console.log("Admin login email:", adminEmail);
