import Link from "next/link";
import { blogPosts } from "@/lib/data";
export default function BlogPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Blog</h1>
        <p className="mt-2 text-[#a0a0a0]">Style guides, behind the scenes, and more.</p>
        <div className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map(p => (
            <article key={p.id} className="group">
              <div className="aspect-video flex items-center justify-center border border-[#2a2a2a] bg-[#111]">
                <span className="text-4xl font-bold text-[#2a2a2a]">{p.title[0]}</span>
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{p.date}</p>
                <h2 className="mt-1 text-lg font-semibold text-white group-hover:text-[#d4af37] transition-colors">{p.title}</h2>
                <p className="mt-2 text-sm text-[#a0a0a0]">{p.excerpt}</p>
                <Link href={"/blog/" + p.slug} className="mt-3 inline-block text-sm uppercase tracking-widest text-[#d4af37] hover:text-[#b8960f]">Read More</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
