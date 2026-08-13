"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatPrice, waLink, orderSummary } from "@/lib/utils";

const STORE_WHATSAPP = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";

interface Design {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sizePrices: Record<string, number>;
  image: string;
}

export default function DesignDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [design, setDesign] = useState<Design | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [size, setSize] = useState("M");
  const [form, setForm] = useState({ fabric: "", color: "", dimensions: "", notes: "", customerName: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [sentOrder, setSentOrder] = useState<{ size: string; price: number; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/designs?slug=" + params.slug).then(r => r.json()).then(d => {
      if (d.error) setNotFound(true);
      else { setDesign(d); setSize(Object.keys(d.sizePrices ?? {}).length ? Object.keys(d.sizePrices)[0] : "M"); }
    }).catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center pt-16">
      <h1 className="text-2xl font-bold text-white">Design not found</h1>
      <p className="mt-2 text-[#a0a0a0]">This design may have been removed or is not yet active.</p>
      <button onClick={() => router.push("/designs")} className="mt-6 rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f]">Back to Designs</button>
    </div>
  );

  const current = design;
  if (!current) return <div className="flex min-h-[60vh] items-center justify-center pt-16"><p className="text-[#a0a0a0]">Loading...</p></div>;

  const sizes = Object.keys(current.sizePrices ?? {}).length ? [...new Set([...Object.keys(current.sizePrices), "S", "M", "L", "XL"])] : ["S", "M", "L", "XL"];
  const unitPrice = current.sizePrices?.[size] ?? current.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("idle");
    try {
      const res = await fetch("/api/design-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId: current.id, size, quantity: 1, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Order failed"); setStatus("error"); return; }
      setSentOrder({ size, price: data.price, total: data.total });
      setStatus("sent");
    } catch { setError("Something went wrong"); setStatus("error"); }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="aspect-[3/4] overflow-hidden rounded-md border border-[#2a2a2a] bg-black">
              {current.image ? <img src={current.image} alt={current.name} className="h-full w-full object-cover" /> : (
                <div className="flex h-full items-center justify-center"><span className="text-8xl font-black tracking-widest text-[#2a2a2a]">{current.name[0]}</span></div>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Made-to-Order</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{current.name}</h1>
            <p className="mt-4 leading-relaxed text-[#a0a0a0]">{current.description}</p>
            <p className="mt-4 text-xl font-semibold text-[#d4af37]">{formatPrice(unitPrice)}</p>

            <div className="mt-8">
              <p className="text-sm font-semibold text-white">Select Size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button key={s} type="button" onClick={() => setSize(s)} className={`min-w-12 rounded-md border px-4 py-2.5 text-sm font-medium transition-all ${size === s ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-[#2a2a2a] bg-[#111] text-[#c9c9c9] hover:border-[#d4af37]/50"}`}>
                    {s}
                    {current.sizePrices?.[s] && <span className="ml-1 text-[10px] opacity-70">{formatPrice(current.sizePrices[s])}</span>}
                  </button>
                ))}
              </div>
            </div>

            {status === "sent" ? (
              <div className="mt-8 space-y-4 rounded-md border border-green-500/50 bg-green-500/10 p-6 text-sm text-green-400">
                <p>Thank you! Your custom order request has been received. Our team will contact you at {form.email} to confirm the details.</p>
                {sentOrder && STORE_WHATSAPP && (
                  <a href={waLink(STORE_WHATSAPP, orderSummary([
                    ["Kstyles custom order", `${current.name} (${sentOrder.size})`],
                    ["Price", `${formatPrice(sentOrder.total)}`],
                    ["Name", form.customerName],
                    ["Email", form.email],
                    ["Phone", form.phone],
                    ["Fabric", form.fabric],
                    ["Colour", form.color],
                    ["Measurements", form.dimensions],
                    ["Notes", form.notes],
                  ])) ?? "#"} target="_blank" rel="noopener noreferrer"
                    className="mt-1 inline-block rounded-md bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#1ebe5b] transition-colors">
                    Send order to us on WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-md border border-[#2a2a2a] bg-[#111] p-6">
                <p className="text-sm font-semibold text-white">Request This Design</p>
                {error && <p className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="block text-xs font-semibold text-[#a0a0a0]">Full Name</label><input required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
                  <div><label className="block text-xs font-semibold text-[#a0a0a0]">Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
                </div>
                <div><label className="block text-xs font-semibold text-[#a0a0a0]">Phone / WhatsApp (optional — fastest way to reach you)</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +254 7XX XXX XXX" className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="block text-xs font-semibold text-[#a0a0a0]">Fabric Preference</label><input value={form.fabric} onChange={e => setForm({ ...form, fabric: e.target.value })} placeholder="e.g. Heavy cotton, Silk" className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
                  <div><label className="block text-xs font-semibold text-[#a0a0a0]">Colour</label><input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="e.g. Black, Ivory" className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
                </div>
                <div><label className="block text-xs font-semibold text-[#a0a0a0]">Custom Measurements (optional)</label><input value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. Chest 40'' Waist 32'' Length 28''" className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
                <div><label className="block text-xs font-semibold text-[#a0a0a0]">Notes for the Tailor</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
                <button type="submit" className="w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Request {current.name} — {formatPrice(unitPrice)}</button>
                <p className="text-center text-[10px] text-[#555]">No payment taken now. We confirm price and details by email first.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}