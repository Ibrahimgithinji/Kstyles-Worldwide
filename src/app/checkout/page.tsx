"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, clearCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", address: "", city: "", zip: "", country: "US" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setItems(getCart()); }, []);
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const displayTotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Order failed"); return; }
      setConfirmedTotal(data.total);
      clearCart();
      alert("Order placed successfully! Order ID: " + data.id.slice(0, 8) + " — Total: " + formatPrice(data.total));
      router.push("/");
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  }
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white">Checkout</h1>
        {items.length === 0 ? (
          <p className="mt-8 text-[#a0a0a0]">Your cart is empty.</p>
        ) : (
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="block text-sm font-semibold text-white">First Name</label><input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-white">Last Name</label><input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            </div>
            <div><label className="block text-sm font-semibold text-white">Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            <div><label className="block text-sm font-semibold text-white">Address</label><input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="block text-sm font-semibold text-white">City</label><input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-white">ZIP</label><input required value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-white">Country</label><select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none"><option>US</option><option>UK</option><option>CA</option></select></div>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors disabled:opacity-50">{loading ? "Placing order..." : "Place Order"}</button>
          </form>
          <div className="rounded-md border border-[#2a2a2a] bg-[#111] p-6 h-fit">
            <h3 className="text-lg font-semibold text-white">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((p, i) => (
                <div key={i} className="flex gap-4"><div className="h-16 w-16 flex-shrink-0 overflow-hidden border border-[#2a2a2a] bg-black">{p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><span className="font-bold text-[#2a2a2a]">{p.name[0]}</span></div>}</div><div><p className="text-sm text-white">{p.name} &times; {p.quantity}</p><p className="text-sm text-[#d4af37]">{formatPrice(p.price)}</p></div></div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-[#2a2a2a] pt-4 text-sm">
              <div className="flex justify-between text-[#a0a0a0]"><span>Subtotal</span><span>{formatPrice(displayTotal)}</span></div>
              <div className="flex justify-between text-[#a0a0a0]"><span>Shipping</span><span>Free</span></div>
              <div className="flex justify-between text-white font-semibold"><span>Total</span><span>{formatPrice(confirmedTotal ?? displayTotal)}</span></div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
