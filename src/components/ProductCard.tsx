import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
export default function ProductCard({ product }: { product: any }) {
  return (
    <Link href={"/shop/" + product.id} className="group">
      <div className="aspect-[3/4] overflow-hidden border border-[#2a2a2a] bg-[#111] group-hover:border-[#d4af37] transition-colors">
        {product.image ? (
          <Image src={product.image} alt={product.name} width={600} height={800} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex h-full items-center justify-center"><span className="text-6xl font-bold text-[#2a2a2a]">{product.name[0]}</span></div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{product.category}</p>
        <h3 className="mt-1 text-sm font-semibold text-white">{product.name}</h3>
        <p className="mt-1 text-sm text-[#d4af37]">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
