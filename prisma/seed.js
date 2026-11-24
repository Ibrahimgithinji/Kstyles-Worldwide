const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const { emailLookup, encryptSensitiveData } = require("../src/lib/sensitive-data.js");
const catalogProducts = require("../src/lib/catalog-products.json");

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    email_lookup TEXT,
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
    currency TEXT NOT NULL DEFAULT 'USD',
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
    email_lookup TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
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

const hasColumn = (table, name) =>
  db.prepare(`PRAGMA table_info(${table})`).all().some(column => column.name === name);
if (!hasColumn("users", "email_lookup")) db.exec("ALTER TABLE users ADD COLUMN email_lookup TEXT");
if (!hasColumn("subscribers", "email_lookup")) db.exec("ALTER TABLE subscribers ADD COLUMN email_lookup TEXT");
if (!hasColumn("orders", "currency")) db.exec("ALTER TABLE orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD'");
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS users_email_lookup_unique ON users (email_lookup);
  CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_lookup_unique ON subscribers (email_lookup);
`);

const upsert = (table, cols, row) => {
  const placeholders = cols.map(() => "?").join(",");
  const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`;
  db.prepare(sql).run(...cols.map((c) => row[c]));
};

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
const existingAdmin = db.prepare("SELECT * FROM users WHERE email_lookup = ? OR email = ?")
  .get(emailLookup(adminEmail, "users"), adminEmail);
if (!existingAdmin) {
  const adminPassword = getSeedAdminPassword();
  upsert(
    "users",
    ["id", "name", "email", "email_lookup", "password", "role"],
    {
      id: "admin-1",
      name: encryptSensitiveData("Admin"),
      email: encryptSensitiveData(adminEmail),
      email_lookup: emailLookup(adminEmail, "users"),
      password: bcrypt.hashSync(adminPassword, 10),
      role: "admin",
    }
  );
  console.log("Admin user created.");
} else {
  console.log("Admin user already exists — password left unchanged.");
}

// Replace only the original sample listings; order-item snapshots remain intact.
const legacyProductSlugs = [
  "oversized-denim-jacket", "signature-hoodie", "cargo-pants", "leather-bomber-jacket",
  "graphic-tee", "wide-leg-trousers", "k-styles-jersey", "k-styles-custom-jersey",
  "k-styles-signature-jersey", "orange-crystal-sweatshirt", "crystal-statement-crewneck",
  "crystal-luxe-pullover",
];
const deleteLegacyProducts = db.prepare(
  `DELETE FROM products WHERE slug IN (${legacyProductSlugs.map(() => "?").join(",")})`,
);
const saveCatalogProduct = db.prepare(`
  INSERT INTO products (id, name, slug, description, price, image, category, sizes, colors, featured)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    slug = excluded.slug,
    description = excluded.description,
    price = excluded.price,
    image = excluded.image,
    category = excluded.category,
    sizes = excluded.sizes,
    colors = excluded.colors,
    featured = excluded.featured
`);
db.transaction(() => {
  deleteLegacyProducts.run(...legacyProductSlugs);
  for (const product of catalogProducts) {
    saveCatalogProduct.run(
      product.id,
      product.name,
      product.slug,
      product.description,
      product.price,
      product.variants[0].image,
      product.category,
      product.sizes.join(","),
      product.variants.map(variant => variant.label).join(","),
      product.featured ? 1 : 0,
    );
  }
})();

// Sample made-to-order designs — only seeded when the designs table is empty,
// so designs created or hidden by the admin are never overwritten.
const designCount = db.prepare("SELECT COUNT(*) c FROM designs").get().c;
if (designCount === 0) {
  const designs = [
    {
      id: "design-sig-suit", name: "The Kstyles Signature Suit", slug: "kstyles-signature-suit",
      description: "Our flagship made-to-order two-piece suit. Hand-finished lapels, half-canvas construction and a silhouette cut to your exact measurements. Choose your fabric and lining, we do the rest.",
      price: 329, sizePrices: JSON.stringify({ S: 309, M: 329, L: 349, XL: 369 }),
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
      category: "Suits", tags: "suit,bespoke,formal", active: 1,
    },
    {
      id: "design-exec-blazer", name: "The Executive Blazer", slug: "executive-blazer",
      description: "A sharp, single-breasted blazer built for boardrooms and nightlife alike. Structured shoulders, pearl-lined interior, and a taper that flatters without restricting.",
      price: 209, sizePrices: JSON.stringify({ S: 189, M: 209, L: 229, XL: 249 }),
      image: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=900&q=80",
      category: "Blazers", tags: "blazer,formal,workwear", active: 1,
    },
    {
      id: "design-heritage-kaftan", name: "The Heritage Kaftan", slug: "heritage-kaftan",
      description: "A flowing, embroidered kaftan celebrating East African tailoring heritage. Woven fabrics, hand-stitched trims, and room to move — made for weddings, Eid and grand entrances.",
      price: 249, sizePrices: JSON.stringify({ S: 229, M: 249, L: 269, XL: 289 }),
      image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80",
      category: "Kaftans", tags: "kaftan,traditional,celebrations", active: 1,
    },
    {
      id: "design-evening-gown", name: "The Evening Gown", slug: "evening-gown",
      description: "A floor-length gown draped in premium fabric with a fitted bodice and flowing skirt. Custom-lined to your preference, finished with concealed boning for structure.",
      price: 389, sizePrices: JSON.stringify({ S: 369, M: 389, L: 409, XL: 429 }),
      image: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=900&q=80",
      category: "Dresses & Gowns", tags: "gown,formal,women", active: 1,
    },
    {
      id: "design-safari-jacket", name: "The Safari Jacket", slug: "safari-jacket",
      description: "Four-pocket safari jacket in breathable cotton drill. Belted waist, horn buttons and a relaxed collar — the perfect bridge between outdoor utility and urban polish.",
      price: 179, sizePrices: JSON.stringify({ S: 159, M: 179, L: 199, XL: 219 }),
      image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
      category: "Jackets & Coats", tags: "jacket,casual,outdoor", active: 1,
    },
    {
      id: "design-statement-coat", name: "The Statement Coat", slug: "statement-coat",
      description: "An oversized wool-blend coat with dramatic collar and double-breasted closure. Fully lined, hand-finished edges, and enough presence to end any outfit debate.",
      price: 429, sizePrices: JSON.stringify({ S: 409, M: 429, L: 449, XL: 469 }),
      image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=80",
      category: "Jackets & Coats", tags: "coat,outerwear,winter", active: 1,
    },
    {
      id: "design-ceremony-suit", name: "The Ceremony Suit", slug: "ceremony-suit",
      description: "Our showpiece three-piece suit for weddings and milestone celebrations. Contrasting waistcoat, satin lapels, and a cut designed to be remembered.",
      price: 459, sizePrices: JSON.stringify({ S: 439, M: 459, L: 479, XL: 499 }),
      image: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=900&q=80",
      category: "Suits", tags: "suit,wedding,three-piece", active: 1,
    },
    {
      id: "design-orange-varsity", name: "Bright Orange Crystal Varsity Sweatshirt", slug: "orange-crystal-varsity-sweatshirt",
      description: "Statement varsity sweatshirt with vivid bright-orange crystal detailing. Heavyweight body, embroidered monogram and hand-set crystals. Made to order in your size.",
      price: 2499, sizePrices: JSON.stringify({ S: 2299, M: 2499, L: 2699, XL: 2899 }),
      image: "/images/designs/orange-crystal-varsity-sweatshirt.png",
      category: "Sweatshirts", tags: "orange,crystal,varsity,statement", active: 1,
    },
  ];
  for (const d of designs) {
    db.prepare("INSERT INTO designs (id, name, slug, description, price, sizePrices, image, category, tags, active, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))")
      .run(d.id, d.name, d.slug, d.description, d.price, d.sizePrices, d.image, d.category, d.tags, d.active);
  }
  console.log("Sample designs created (" + designs.length + ").");
} else {
  console.log("Designs table not empty — sample designs skipped.");
}

console.log("Seed complete!");
console.log("  users:", db.prepare("SELECT COUNT(*) c FROM users").get().c);
console.log("  products:", db.prepare("SELECT COUNT(*) c FROM products").get().c);
console.log("  designs:", db.prepare("SELECT COUNT(*) c FROM designs").get().c);
console.log("Admin login email:", adminEmail);
