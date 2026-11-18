const Database = require("better-sqlite3");
const path = require("path");
const catalog = require("../src/lib/catalog-products.json");

const legacySampleSlugs = [
  "oversized-denim-jacket",
  "signature-hoodie",
  "cargo-pants",
  "leather-bomber-jacket",
  "graphic-tee",
  "wide-leg-trousers",
  "k-styles-jersey",
  "k-styles-custom-jersey",
  "k-styles-signature-jersey",
  "orange-crystal-sweatshirt",
  "crystal-statement-crewneck",
  "crystal-luxe-pullover",
];

const db = new Database(path.join(process.cwd(), "prisma", "dev.db"));
const tableExists = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'products'").get();
if (!tableExists) {
  db.close();
  throw new Error("The products table does not exist. Initialize the local database first.");
}

const removeLegacySamples = db.prepare(
  `DELETE FROM products WHERE slug IN (${legacySampleSlugs.map(() => "?").join(",")})`,
);
const upsertProduct = db.prepare(`
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

const sync = db.transaction(() => {
  removeLegacySamples.run(...legacySampleSlugs);
  for (const product of catalog) {
    const firstVariant = product.variants[0];
    if (!firstVariant) throw new Error(`Catalog product has no image variant: ${product.slug}`);
    upsertProduct.run(
      product.id,
      product.name,
      product.slug,
      product.description,
      product.price,
      firstVariant.image,
      product.category,
      product.sizes.join(","),
      product.variants.map(variant => variant.label).join(","),
      product.featured ? 1 : 0,
    );
  }
});

try {
  sync();
  console.log(`Synchronized ${catalog.length} catalogue products; order history was not changed.`);
} finally {
  db.close();
}
