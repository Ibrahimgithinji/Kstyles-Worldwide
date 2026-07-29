"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/data";
const cats = ["All", "Outerwear", "Tops", "Bottoms"];
export default function ShopPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? products : products.filter(p => p.category === active.toLowerCase());
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Shop All</h1>
        <p className="mt-2 text-[#a0a0a0]">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
        <div className="mt-8 flex gap-2">
          {cats.map(c => (
            <button key={c} onClick={() => setActive(c)} className={`rounded-md px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
              active === c ? "bg-[#d4af37] text-black" : "border border-[#2a2a2a] text-[#a0a0a0] hover:text-white"
            }`}>{c}</button>
          ))}
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
