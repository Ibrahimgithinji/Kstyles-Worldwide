import Link from "next/link";
import Image from "next/image";
export const dynamic = "force-dynamic";
async function getCollections() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL || "", { next: { revalidate: 0 } });
  if (!res.ok) return [];
  return res.json();
}
export default async function CollectionsPage() {
  let collections: { id: string; name: string; description: string; image: string; slug: string }[] = [];
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(base + "/api/collections", { cache: "no-store" });
    if (res.ok) collections = await res.json();
  } catch {}
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Collections</h1>
        <p className="mt-2 text-[#a0a0a0]">Explore our curated collections.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {collections.map(c => (
            <div key={c.id} className="group relative aspect-square overflow-hidden border border-[#2a2a2a] bg-[#111]">
              {c.image && <Image src={c.image} alt={c.name} fill className="object-cover opacity-40 transition-opacity group-hover:opacity-60" sizes="(max-width: 768px) 100vw, 33vw" />}
              <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
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
