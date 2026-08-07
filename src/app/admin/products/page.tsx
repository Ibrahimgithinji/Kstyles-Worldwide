"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";
export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [auth, setAuth] = useState<"loading" | "ok" | "denied">("loading");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", image: "", category: "tops", sizes: "S,M,L,XL", colors: "Black", featured: false });
  const [msg, setMsg] = useState("");
  async function load() {
    const res = await fetch("/api/admin/products", { headers: getAuthHeaders() });
    if (!res.ok) { setAuth("denied"); return; }
    setProducts((await res.json()).products);
    setAuth("ok");
  }
  useEffect(() => { load(); }, []);
  if (auth === "denied") return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-white">Admin access required</h1>
      <p className="mt-2 text-[#a0a0a0]">Please sign in with an admin account to manage products.</p>
      <Link href="/auth/login" className="mt-6 rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Sign In</Link>
    </div>
  );
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ ...form, price: Number(form.price), featured: form.featured }),
    });
    if (res.ok) { setMsg("Product added!"); setShowForm(false); setForm({ name: "", description: "", price: "", image: "", category: "tops", sizes: "S,M,L,XL", colors: "Black", featured: false }); load(); }
    else setMsg("Failed to add product.");
  }
  async function del(id: string) {
    await fetch("/api/admin/products/" + id, { method: "DELETE", headers: getAuthHeaders() });
    load();
  }
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  async function handleUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", headers: getAuthHeaders(), body: fd });
    const data = await res.json();
    if (res.ok) setForm(f => ({ ...f, image: data.url }));
    else setMsg("Upload failed: " + (data.error || "unknown error"));
    setUploading(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleUpload(e.dataTransfer.files?.[0] ?? null);
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-md bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#b8960f] transition-colors">{showForm ? "Cancel" : "Add Product"}</button>
      </div>
      {msg && <p className="mt-4 text-sm text-green-400">{msg}</p>}
      {showForm && (
        <form onSubmit={handleAdd} className="mt-6 rounded-md border border-[#2a2a2a] bg-[#111] p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-semibold text-white">Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            <div><label className="block text-sm font-semibold text-white">Price</label><input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-white">Description</label><textarea required rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="block text-sm font-semibold text-white">Image</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById("file-image-input")?.click()}
                className={`mt-1 flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-4 text-center transition-colors ${dragging ? "border-[#d4af37] bg-[#d4af37]/10" : "border-[#2a2a2a] bg-black hover:border-[#555]"}`}
              >
                {form.image ? (
                  <img src={form.image} alt="" className="max-h-28 rounded object-contain" />
                ) : uploading ? (
                  <p className="text-sm text-[#a0a0a0]">Uploading...</p>
                ) : (
                  <>
                    <span className="text-2xl text-[#d4af37]">+</span>
                    <p className="text-xs text-[#a0a0a0]">Drag &amp; drop image or click to browse</p>
                    <p className="text-[10px] text-[#555]">PNG, JPG, WebP — up to 5MB</p>
                  </>
                )}
              </div>
              <input id="file-image-input" type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files?.[0] ?? null)} />
              <input id="file-image-url" type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder=".or paste image URL" className="mt-2 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none" />
            </div>
            <div><label className="block text-sm font-semibold text-white">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none"><option>tops</option><option>bottoms</option><option>outerwear</option><option>accessories</option></select></div>
            <div><label className="block text-sm font-semibold text-white">Sizes (comma)</label><input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          <button type="submit" className="rounded-md bg-[#d4af37] px-6 py-2 text-sm font-semibold text-black hover:bg-[#b8960f] transition-colors">Save Product</button>
        </form>
      )}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
            <tr><th className="pb-3 pr-4 font-medium">Product</th><th className="pb-3 pr-4 font-medium">Price</th><th className="pb-3 pr-4 font-medium">Category</th><th className="pb-3 pr-4 font-medium">Featured</th><th className="pb-3 font-medium"></th></tr>
          </thead>
          <tbody className="text-white">
            {products.map(p => (
              <tr key={p.id} className="border-b border-[#2a2a2a]">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {p.image && <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />}
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">{formatPrice(p.price)}</td>
                <td className="py-3 pr-4">{p.category}</td>
                <td className="py-3 pr-4">{p.featured ? "Yes" : "No"}</td>
                <td className="py-3"><button onClick={() => del(p.id)} className="text-red-400 hover:text-red-300">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
