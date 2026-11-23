import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import db from "@/lib/db";
import { presentProduct, type ProductRecord } from "@/lib/catalog";

const categories = [
  { id: "hoodies", label: "Hoodies" },
  { id: "jerseys", label: "Custom Jerseys" },
  { id: "tees", label: "Tees" },
  { id: "headwear", label: "Headwear" },
];

export default async function CatalogSections() {
  const rows = await db.prepare("SELECT * FROM products ORDER BY createdAt DESC").all<ProductRecord>();
  const products = rows.map(presentProduct);
  const sections = categories
    .map(category => ({
      ...category,
      products: products.filter(product => product.category === category.id),
    }))
    .filter(section => section.products.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="border-t border-[#2a2a2a]">
      {sections.map(section => (
        <section key={section.id} className="scroll-reveal border-b border-[#2a2a2a] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-bold text-white">{section.label}</h2>
              <Link href="/shop" className="text-sm uppercase tracking-widest text-[#d4af37] hover:text-[#b8960f]">View All</Link>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {section.products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
