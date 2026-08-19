"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/auth-client";
import { formatPrice, waLink, orderSummary } from "@/lib/utils";

interface Design { id: string; name: string; slug: string; description: string; price: number; sizePrices: string; image: string; category: string; tags: string; active: number; }
interface DesignOrder { id: string; designName: string; size: string; price: number; quantity: number; fabric: string; color: string; dimensions: string; notes: string; customerName: string; email: string; phone: string; status: string; createdAt: string; }

const ORDER_STATUSES = ["pending", "contacted", "in_production", "complete", "cancelled"];
const DESIGN_CATEGORIES = ["Suits", "Blazers", "Kaftans", "Dresses & Gowns", "Jackets & Coats", "Jerseys", "Other"];

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [auth, setAuth] = useState<"loading" | "ok" | "denied">("loading");
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", image: "", category: "", tags: "", sizePrices: "S:149,M:169,L:189,XL:199", active: true });

  async function load() {
    const res = await fetch("/api/admin/designs", { headers: getAuthHeaders() });
    if (!res.ok) { setAuth("denied"); return; }
    const data = await res.json();
    setDesigns(data.designs ?? []);
    setOrders(data.orders ?? []);
    setAuth("ok");
  }
  useEffect(() => { load(); }, []);

  if (auth === "denied") return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-white">Admin access required</h1>
      <p className="mt-2 text-[#a0a0a0]">Please sign in with an admin account to manage designs.</p>
      <Link href="/auth/login" className="mt-6 rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Sign In</Link>
    </div>
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const sizePrices: Record<string, number> = {};
    form.sizePrices.split(",").forEach(part => {
      const [k, v] = part.split(":").map(s => s.trim());
      if (k && v && !isNaN(Number(v))) sizePrices[k] = Number(v);
    });
    const res = await fetch("/api/admin/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ ...form, price: Number(form.price), sizePrices, active: form.active }),
    });
    const data = await res.json();
    if (res.ok) { setMsg("Design added!"); setShowForm(false); setForm({ name: "", slug: "", description: "", price: "", image: "", category: "", tags: "", sizePrices: "S:149,M:169,L:189,XL:199", active: true }); load(); }
    else setMsg(data.error || "Failed to add design.");
  }

  async function toggleActive(d: Design) {
    await fetch("/api/admin/designs/" + d.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ name: d.name, slug: d.slug, description: d.description, price: d.price, sizePrices: d.sizePrices, image: d.image, category: d.category, tags: d.tags, active: d.active ? 0 : 1 }),
    });
    load();
  }

  async function del(d: Design) {
    if (!window.confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    await fetch("/api/admin/designs/" + d.id, { method: "DELETE", headers: getAuthHeaders() });
    load();
  }

  async function setOrderStatus(orderId: string, status: string) {
    await fetch("/api/admin/designs", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ designId: orderId, status }),
    });
    load();
  }

  const input = "mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Designs</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-md bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#b8960f] transition-colors">{showForm ? "Cancel" : "Add Design"}</button>
      </div>
      {msg && <p className="mt-4 text-sm text-green-400">{msg}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="mt-6 space-y-4 rounded-md border border-[#2a2a2a] bg-[#111] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-semibold text-white">Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={input} /></div>
            <div><label className="block text-sm font-semibold text-white">Base Price</label><input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={input} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-semibold text-white">Slug</label><input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="custom-blazer" className={input} /></div>
            <div><label className="block text-sm font-semibold text-white">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={input}>
                <option value="">Uncategorized</option>
                {DESIGN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-semibold text-white">Image URL <span className="text-[#a0a0a0]">(or upload via Products uploader)</span></label><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className={input} /></div>
            <div><label className="block text-sm font-semibold text-white">Tags</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className={input} /></div>
          </div>
          <div><label className="block text-sm font-semibold text-white">Description</label><textarea required rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={input} /></div>
          <div><label className="block text-sm font-semibold text-white">Size Prices (format: S:149,M:169,L:189,XL:199)</label><input value={form.sizePrices} onChange={e => setForm({ ...form, sizePrices: e.target.value })} className={input} /></div>
          <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active (visible in gallery)</label>
          <button type="submit" className="rounded-md bg-[#d4af37] px-6 py-2 text-sm font-semibold text-black hover:bg-[#b8960f] transition-colors">Save Design</button>
        </form>
      )}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
            <tr><th className="pb-3 pr-4 font-medium">Design</th><th className="pb-3 pr-4 font-medium">Category</th><th className="pb-3 pr-4 font-medium">Base</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 font-medium"></th></tr>
          </thead>
          <tbody className="text-white">
            {designs.map(d => (
              <tr key={d.id} className="border-b border-[#2a2a2a]">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {d.image && <img src={d.image} alt="" className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <p>{d.name}</p>
                      <p className="text-xs text-[#a0a0a0]">/{d.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">{d.category ? <span className="text-xs text-[#a0a0a0]">{d.category}</span> : <span className="text-xs text-[#2a2a2a]">—</span>}</td>
                <td className="py-3 pr-4">{formatPrice(d.price)}</td>
                <td className="py-3 pr-4">{d.active ? <span className="text-green-400">Active</span> : <span className="text-[#a0a0a0]">Hidden</span>}</td>
                <td className="py-3 text-right">
                  <button onClick={() => toggleActive(d)} className="mr-3 text-[#d4af37] hover:text-[#b8960f]">{d.active ? "Hide" : "Show"}</button>
                  <button onClick={() => del(d)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-bold text-white">Custom Order Requests</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
            <tr><th className="pb-3 pr-4 font-medium">Customer</th><th className="pb-3 pr-4 font-medium">Design</th><th className="pb-3 pr-4 font-medium">Size/Qty</th><th className="pb-3 pr-4 font-medium">Price</th><th className="pb-3 pr-4 font-medium">Details</th><th className="pb-3 font-medium">Status</th></tr>
          </thead>
          <tbody className="text-white">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-[#a0a0a0]">No custom order requests yet.</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="border-b border-[#2a2a2a] align-top">
                <td className="py-3 pr-4"><p>{o.customerName}</p><p className="text-xs text-[#a0a0a0]">{o.email}</p>{o.phone && <p className="text-xs text-[#a0a0a0]">{o.phone}</p>}</td>
                <td className="py-3 pr-4">{o.designName}</td>
                <td className="py-3 pr-4">{o.size} × {o.quantity}</td>
                <td className="py-3 pr-4">{formatPrice(o.price * o.quantity)}
                  {o.phone && (
                    <a href={waLink(o.phone, orderSummary([
                      ["Order", `Kstyles custom order — ${o.designName} (${o.size})`],
                      ["Name", o.customerName],
                      ["Total", formatPrice(o.price * o.quantity)],
                      ["Fabric", o.fabric],
                      ["Colour", o.color],
                      ["Measurements", o.dimensions],
                      ["Notes", o.notes],
                    ])) ?? "#"} target="_blank" rel="noopener noreferrer"
                      className="mt-1 block text-xs text-[#25D366] hover:text-[#1ebe5b]">
                      WhatsApp customer
                    </a>
                  )}
                </td>
                <td className="py-3 pr-4 max-w-[260px]">
                  {o.fabric && <p className="text-xs text-[#a0a0a0]">Fabric: {o.fabric}</p>}
                  {o.color && <p className="text-xs text-[#a0a0a0]">Colour: {o.color}</p>}
                  {o.dimensions && <p className="text-xs text-[#a0a0a0]">Measurements: {o.dimensions}</p>}
                  {o.notes && <p className="text-xs text-[#a0a0a0]">Notes: {o.notes}</p>}
                </td>
                <td className="py-3">
                  <select value={o.status} onChange={e => setOrderStatus(o.id, e.target.value)} className="rounded-md border border-[#2a2a2a] bg-black px-2 py-1.5 text-xs text-white focus:border-[#d4af37] focus:outline-none">
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}