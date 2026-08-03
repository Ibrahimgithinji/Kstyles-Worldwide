import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function BlogPage() {
  let posts: { slug: string; title: string; excerpt: string; date: string; author: string; tags: string[] }[] = [];
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(base + "/api/blog", { cache: "no-store" });
    if (res.ok) posts = await res.json();
  } catch {}
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Blog</h1>
        <p className="mt-2 text-[#a0a0a0]">Style guides, stories, and behind-the-scenes.</p>
        <div className="mt-12 space-y-8">
          {posts.map(p => (
            <Link key={p.slug} href={"/blog/" + p.slug} className="block border border-[#2a2a2a] bg-[#111] p-6 transition-colors hover:border-[#d4af37]">
              <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{p.date} &middot; {p.author}</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{p.title}</h2>
              <p className="mt-2 text-sm text-[#a0a0a0]">{p.excerpt}</p>
              <div className="mt-4 flex gap-2">
                {p.tags.map(t => <span key={t} className="rounded-full border border-[#2a2a2a] px-3 py-1 text-xs text-[#a0a0a0]">{t}</span>)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
