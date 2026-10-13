"use client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string | null;
  price: number;
  sizes: string;
  colors: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [p, setP] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  useEffect(() => { fetch("/api/products/" + id).then(r => r.json()).then((d: { product: Product | null }) => { setP(d.product); if (d.product) { setSize(d.product.sizes.split(",")[0]); setColor(d.product.colors.split(",")[0]); } }); }, [id]);
  if (!p) return <div className="pt-24 text-center"><p className="text-[#a0a0a0]">Loading...</p></div>;
  const sizes: string[] = p.sizes.split(",");
  const colors: string[] = p.colors.split(",");
  const colorClassMap: Record<string, string> = {
    Black: "bg-black",
    White: "bg-white",
    Cream: "bg-[#f5f5dc]",
    Olive: "bg-[#556b2f]",
    Khaki: "bg-[#c3b091]",
    Grey: "bg-[#808080]",
    Navy: "bg-[#000080]",
    Charcoal: "bg-[#36454f]",
    Indigo: "bg-[#3f51b5]",
    Brown: "bg-[#8b4513]",
  };
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-[3/4] overflow-hidden border border-[#2a2a2a] bg-[#111]">
            {p.image ? <Image src={p.image} alt={p.name} width={800} height={1067} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><span className="text-9xl font-bold text-[#2a2a2a]">{p.name[0]}</span></div>}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{p.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{p.name}</h1>
            <p className="mt-4 text-2xl text-[#d4af37]">{formatPrice(p.price)}</p>
            <p className="mt-6 text-[#a0a0a0] leading-relaxed">{p.description}</p>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-white">Size: {size}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map(s => <button key={s} onClick={() => setSize(s)} className={`rounded-md border px-4 py-2 text-sm transition-colors ${size === s ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-[#2a2a2a] text-white hover:border-[#d4af37]"}`}>{s}</button>)}
              </div>
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-white">Color: {color}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map(c => <button key={c} onClick={() => setColor(c)} className={`h-8 w-8 rounded-full border transition-all ${color === c ? "ring-2 ring-[#d4af37] ring-offset-2 ring-offset-black" : "border-[#2a2a2a]"} ${colorClassMap[c] || "bg-[#d4af37]"}`} title={c} />)}
              </div>
            </div>
            <button onClick={() => { addToCart({ productId: p.id, name: p.name, price: p.price, image: p.image ?? "", size, color, quantity: 1 }); router.push("/cart"); }} className="mt-10 w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
