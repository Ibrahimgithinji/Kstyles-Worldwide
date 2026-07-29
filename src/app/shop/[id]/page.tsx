"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
export default function ProductDetail() {
  const { id } = useParams();
  const p = products.find(x => x.id === id);
  if (!p) return (
    <div className="pt-24 text-center">
      <p className="text-[#a0a0a0]">Product not found.</p>
      <Link href="/shop" className="text-[#d4af37] underline">Back to shop</Link>
    </div>
  );
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-[3/4] flex items-center justify-center bg-[#111] border border-[#2a2a2a]">
            <span className="text-9xl font-bold text-[#2a2a2a]">{p.name[0]}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{p.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{p.name}</h1>
            <p className="mt-4 text-2xl text-[#d4af37]">{formatPrice(p.price)}</p>
            <p className="mt-6 text-[#a0a0a0] leading-relaxed">{p.description}</p>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-white">Sizes</p>
              <div className="mt-3 flex gap-2">
                {p.sizes.map(s => <button key={s} className="rounded-md border border-[#2a2a2a] px-4 py-2 text-sm text-white hover:border-[#d4af37] transition-colors">{s}</button>)}
              </div>
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-white">Colors</p>
              <div className="mt-3 flex gap-2">
                {p.colors.map(c => <div key={c} className="h-8 w-8 rounded-full border border-[#2a2a2a]" title={c} style={{ backgroundColor: c === "Black" ? "#000" : c === "White" ? "#fff" : c === "Cream" ? "#f5f5dc" : c === "Olive" ? "#556b2f" : c === "Khaki" ? "#c3b091" : c === "Grey" ? "#808080" : c === "Navy" ? "#000080" : c === "Charcoal" ? "#36454f" : c === "Indigo" ? "#3f51b5" : c === "Brown" ? "#8b4513" : "#d4af37" }} />)}
              </div>
            </div>
            <button className="mt-10 w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
