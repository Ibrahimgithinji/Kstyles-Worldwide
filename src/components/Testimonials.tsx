import { testimonials } from "@/lib/data";
export default function Testimonials() {
  return (
    <section className="bg-black py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">What Our Customers Say</h2>
          <p className="mt-2 text-[#a0a0a0]">Real reviews from the Kstyles community.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map(t => (
            <div key={t.id} className="flex flex-col border border-[#2a2a2a] bg-[#111] p-6">
              <div className="flex gap-1 text-[#d4af37]">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#a0a0a0]">&ldquo;{t.content}&rdquo;</p>
              <div className="mt-6">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
