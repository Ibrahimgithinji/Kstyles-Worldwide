"use client";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";
export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", category: "", image: "", sizes: "S,M,L,XL", colors: "Black", featured: false });
  async function load() {
    const res = await fetch("/api/admin/products", { headers: getAuthHeaders() });
    if (res.ok) { const d = await res.json(); setProducts(d.products); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), featured: form.featured }),
    });
    if (res.ok) { setShowForm(false); setForm({ name: "", slug: "", description: "", price: "", category: "", image: "", sizes: "S,M,L,XL", colors: "Black", featured: false }); load(); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/admin/products/" + id, { method: "DELETE", headers: getAuthHeaders() });
    load();
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-md bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black">{showForm ? "Cancel" : "Add Product"}</button>
      </div>
      {showForm && (
        <form onSubmit={addProduct} className="mt-6 rounded-md border border-[#2a2a2a] bg-[#111] p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" />
            <input required placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" />
            <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" />
            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" />
          </div>
          <input placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" />
          <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          <button type="submit" className="rounded-md bg-[#d4af37] px-6 py-2 text-sm font-semibold text-black">Save Product</button>
        </form>
      )}
      {loading ? <p className="mt-8 text-[#a0a0a0]">Loading...</p> : (
        <table className="mt-8 w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
            <tr><th className="pb-3 pr-4 font-medium">Name</th><th className="pb-3 pr-4 font-medium">Category</th><th className="pb-3 pr-4 font-medium">Price</th><th className="pb-3 pr-4 font-medium">Featured</th><th className="pb-3 font-medium">Actions</th></tr>
          </thead>
          <tbody className="text-white">
            {products.map(p => (
              <tr key={p.id} className="border-b border-[#2a2a2a]">
                <td className="py-3 pr-4">{p.name}</td>
                <td className="py-3 pr-4 text-[#a0a0a0]">{p.category}</td>
                <td className="py-3 pr-4">{formatPrice(p.price)}</td>
                <td className="py-3 pr-4">{p.featured ? <span className="text-[#d4af37]">Yes</span> : <span className="text-[#a0a0a0]">No</span>}</td>
                <td className="py-3 flex gap-2"><button onClick={() => remove(p.id)} className="text-red-500 hover:underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
