import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: { title: string; content: string; date: string; author: string; tags: string[] } | null = null;
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(base + "/api/blog/" + slug, { cache: "no-store" });
    if (res.ok) post = await res.json();
  } catch {}
  if (!post) return (
    <div className="pt-24 text-center">
      <p className="text-[#a0a0a0]">Post not found.</p>
      <Link href="/blog" className="text-[#d4af37] underline">Back to blog</Link>
    </div>
  );
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-sm uppercase tracking-widest text-[#a0a0a0] hover:text-[#d4af37]">&larr; Back</Link>
        <div className="mt-4 aspect-video flex items-center justify-center border border-[#2a2a2a] bg-[#111]">
          <span className="text-6xl font-bold text-[#2a2a2a]">{post.title[0]}</span>
        </div>
        <div className="mt-8">
          <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{post.date} &middot; {post.author}</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{post.title}</h1>
          <div className="mt-2 flex gap-2">
            {post.tags.map(t => <span key={t} className="rounded-full border border-[#2a2a2a] px-3 py-1 text-xs text-[#a0a0a0]">{t}</span>)}
          </div>
          <p className="mt-8 text-[#a0a0a0] leading-relaxed">{post.content}</p>
        </div>
      </div>
    </div>
  );
}
