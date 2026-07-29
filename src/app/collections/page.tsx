import Link from "next/link";
import { collections } from "@/lib/data";
export default function CollectionsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Collections</h1>
        <p className="mt-2 text-[#a0a0a0]">Explore our curated collections.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {collections.map(c => (
            <div key={c.id} className="group relative aspect-square overflow-hidden border border-[#2a2a2a] bg-[#111]">
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <h3 className="text-2xl font-bold text-white">{c.name}</h3>
                <p className="mt-4 text-sm text-[#a0a0a0]">{c.description}</p>
                <Link href={"/shop"} className="mt-6 text-sm uppercase tracking-widest text-[#d4af37] hover:text-[#b8960f]">Shop Now</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
