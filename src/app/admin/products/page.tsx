"use client";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
export default function AdminProducts() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button className="rounded-md bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black">Add Product</button>
      </div>
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
              <td className="py-3 flex gap-2">
                <button className="text-[#d4af37] hover:underline">Edit</button>
                <button className="text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
