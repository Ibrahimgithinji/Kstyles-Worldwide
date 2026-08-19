"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Design {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags: string;
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[] | null>(null);
  const [cat, setCat] = useState("All");
  useEffect(() => {
    fetch("/api/designs").then(r => r.json()).then(d => setDesigns(d.designs ?? [])).catch(() => setDesigns([]));
  }, []);

  const cats = ["All", ...Array.from(new Set((designs ?? []).map(d => d.category).filter(Boolean)))];
  const filtered = designs === null ? null : cat === "All" ? designs : designs.filter(d => d.category === cat);

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Bespoke</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Made-to-Order Designs</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[#a0a0a0]">
            Every piece can be tailored to your size, fabric and colour. Choose a design, pick your size and we&apos;ll craft it just for you.
          </p>
        </div>

        {designs === null ? (
          <div className="mt-16 rounded-md border border-[#2a2a2a] bg-[#111] p-12 text-center">
            <p className="text-[#a0a0a0]">Loading designs…</p>
          </div>
        ) : designs.length === 0 ? (
          <div className="mt-16 rounded-md border border-[#2a2a2a] bg-[#111] p-12 text-center">
            <p className="text-[#a0a0a0]">New designs are being added. Check back soon.</p>
          </div>
        ) : (
          <>
            {cats.length > 1 && (
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {cats.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${cat === c ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-[#2a2a2a] text-[#a0a0a0] hover:border-[#d4af37]/60 hover:text-white"}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            {filtered!.length === 0 ? (
              <div className="mt-16 rounded-md border border-[#2a2a2a] bg-[#111] p-12 text-center">
                <p className="text-[#a0a0a0]">No designs in this category yet.</p>
              </div>
            ) : (
              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filtered!.map(d => (
                  <Link key={d.id} href={`/designs/${d.slug}`} className="group overflow-hidden rounded-md border border-[#2a2a2a] bg-[#111] transition-all hover:border-[#d4af37]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                    <div className="aspect-[3/4] overflow-hidden bg-black">
                      {d.image ? (
                        <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-5xl font-black tracking-widest text-[#2a2a2a]">{d.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[#d4af37]">{d.name}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-[#d4af37]">From {formatPrice(d.price)}</span>
                        <span className="text-xs uppercase tracking-widest text-[#a0a0a0]">Customize</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}