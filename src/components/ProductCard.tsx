import Link from "next/link";
import Image from "next/image";
import { formatKesPrice } from "@/lib/utils";
import type { ProductWithVariants } from "@/lib/catalog";

const categoryLabels: Record<string, string> = {
  headwear: "Headwear",
  hoodies: "Hoodies",
  jerseys: "Jerseys",
  tees: "Tees",
};

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  return (
    <Link href={"/shop/" + product.id} className="group">
      <div className="aspect-[3/4] overflow-hidden border border-[#2a2a2a] bg-[#111] group-hover:border-[#d4af37] transition-colors">
        {product.image ? (
          <Image src={product.image} alt={product.name} width={600} height={800} className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center"><span className="text-6xl font-bold text-[#2a2a2a]">{product.name[0]}</span></div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{categoryLabels[product.category] ?? product.category}</p>
        <h3 className="mt-1 text-sm font-semibold text-white">{product.name}</h3>
        <p className="mt-1 text-sm text-[#d4af37]">{formatKesPrice(product.price)}</p>
        {product.variants.length > 1 && <p className="mt-1 text-xs text-[#a0a0a0]">{product.variants.length} {product.optionLabel.toLowerCase()} options</p>}
      </div>
    </Link>
  );
}
