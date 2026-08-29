import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import db from "@/lib/db";

export default function SweatshirtsSection() {
  const items = db.prepare("SELECT * FROM products WHERE category = 'sweatshirts' ORDER BY createdAt DESC").all() as any[];
  if (items.length === 0) return null;

  return (
    <section className="border-t border-[#2a2a2a] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#d4af37]">Bright Orange Crystal Series</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Sweatshirts</h2>
            <p className="mt-2 text-[#a0a0a0]">Premium sweatshirts embellished with vivid orange crystal detailing. Made to order.</p>
          </div>
          <Link href="/shop" className="text-sm uppercase tracking-widest text-[#d4af37] hover:text-[#b8960f]">View All</Link>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
