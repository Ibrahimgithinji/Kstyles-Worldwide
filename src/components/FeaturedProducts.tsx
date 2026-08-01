import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import db from "@/lib/db";
export default function FeaturedProducts() {
  const featured = db.prepare("SELECT * FROM products WHERE featured = 1 ORDER BY createdAt DESC").all() as any[];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Featured</h2>
            <p className="mt-2 text-[#a0a0a0]">Curated picks from our latest drops.</p>
          </div>
          <Link href="/shop" className="text-sm uppercase tracking-widest text-[#d4af37] hover:text-[#b8960f]">View All</Link>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}